document.addEventListener('DOMContentLoaded', () => {
    const modelViewer = document.querySelector('model-viewer'); 
    const modelList = document.getElementById('model-list'); 
    const modelos = [ 
        { id: 'cairo-led', nombre: 'Lámpara Cairo LED', src: 'modelos/cairoRA-LED.glb', preview: 'assets/previews/cairo-led.jpg' }, 
        { id: 'cairo', nombre: 'Lámpara Cairo', src: 'modelos/cairoRA.glb', preview: 'assets/previews/cairo.jpg' } 
    ]; 
    const placeholderSVG = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWVlZWVlIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgYWxpZ25tZW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM5OTkiPk5vIGRpc3BvbmlibGU8YnIvPjx0c3BhbiBmb250LXNpemU9IjEwIj4odmlzdGEgcHJldmlhKTwvdHNwYW4+PC90ZXh0Pjwvc3ZnPg=='; 
    
    function cargarModelos() { 
        modelList.innerHTML = ''; 
        modelos.forEach(modelo => {
            const modelCard = document.createElement('div'); 
            modelCard.className = 'model-card';
            
            // Crear la imagen de vista previa
            const img = document.createElement('img');
            img.src = modelo.preview;
            img.alt = modelo.nombre;
            img.onerror = () => { img.src = placeholderSVG; };
            
            // Crear el título
            const title = document.createElement('h3');
            title.textContent = modelo.nombre;
            
            // Añadir evento de clic
            modelCard.addEventListener('click', () => {
                modelViewer.src = modelo.src;
                modelViewer.alt = modelo.nombre;
            });
            
            // Añadir elementos al card
            modelCard.appendChild(img);
            modelCard.appendChild(title);
            modelList.appendChild(modelCard);
        });
    }
    
    // Cargar modelos al iniciar
    cargarModelos();
});
