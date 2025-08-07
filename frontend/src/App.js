import React, { useState, useEffect } from 'react';

function App() {
  // Estados del componente
  const [peliculas, setPeliculas] = useState([]);
  const [peliculasFiltradas, setPeliculasFiltradas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [modoDescripcion, setModoDescripcion] = useState(false);
  const [recomendacion, setRecomendacion] = useState('');

  // Al montar el componente, carga las películas desde el backend
  useEffect(() => {
    fetch('/api/peliculas')
      .then(res => res.json())
      .then(data => {
        setPeliculas(data);
        setPeliculasFiltradas(data);
      })
      .catch(err => console.error('Error al obtener películas:', err));
  }, []);

  // Función para búsqueda por título o género
  const handleBuscar = (e) => {
    e.preventDefault();
    const texto = busqueda.toLowerCase();
    const resultado = peliculas.filter(p =>
      p.titulo.toLowerCase().includes(texto) ||
      (p.genero && p.genero.toLowerCase().includes(texto)) ||
      p.titulo.toLowerCase().startsWith(texto)
    );
    setPeliculasFiltradas(resultado);
    setRecomendacion('');
  };

  // Función para búsqueda con IA basada en la descripción
  const handleBuscarPorDescripcion = async () => {
    try {
      const res = await fetch('/api/recomendaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Dame una recomendación basada en esta descripción: ${busqueda}. Usa solo películas de este catálogo: ${peliculas.map(p => p.titulo).join(', ')}.`
        })
      });
      const data = await res.json();
      setRecomendacion(data.recomendacion);

      // Filtra las películas que aparecen en la recomendación
      const seleccionadas = peliculas.filter(p =>
        data.recomendacion.toLowerCase().includes(p.titulo.toLowerCase())
      );
      if (seleccionadas.length > 0) {
        setPeliculasFiltradas(seleccionadas);
      }
    } catch (err) {
      console.error('Error con IA:', err);
    }
  };

  return (
    <div className="App" style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1>Catálogo de Películas</h1>

      <form onSubmit={handleBuscar} style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Buscar películas..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{ padding: 8, width: '300px', marginRight: 10 }}
        />
        {!modoDescripcion ? (
          <button type="submit">Buscar</button>
        ) : (
          <button type="button" onClick={handleBuscarPorDescripcion}>Buscar con IA</button>
        )}
      </form>

      <label style={{ marginBottom: 20, display: 'block' }}>
        <input
          type="checkbox"
          checked={modoDescripcion}
          onChange={() => setModoDescripcion(!modoDescripcion)}
        />
        Buscar por descripción (IA)
      </label>

      {recomendacion && (
        <div style={{ marginBottom: 20, backgroundColor: '#f0f0f0', padding: 10, borderRadius: 5 }}>
          <strong>Recomendación IA:</strong> {recomendacion}
        </div>
      )}

      <div>
        {peliculasFiltradas.length === 0 ? (
          <p>No se encontraron películas.</p>
        ) : (
          peliculasFiltradas.map(pelicula => (
            <div key={pelicula._id || pelicula.id} style={{ marginBottom: 15 }}>
              <h3>{pelicula.titulo}</h3>
              <p><strong>Género:</strong> {pelicula.genero}</p>
              <p>{pelicula.descripcion}</p>
              {pelicula.poster && <img src={pelicula.poster} alt={pelicula.titulo} style={{ maxWidth: 200 }} />}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;