// importamos la clase triangle
import {triangle} from './triangle.js';

function main()
{
    // obtenemos el canvas y lanza un error si no lo puede recuperar
    let canvas = document.getElementById("htmlCanvas");
    if(!canvas)
    {
        console.log("Failed to load the canvas element.");
        return;
    }
    
    // obtenemos el contexto, el slider y el valor del slider
    let ctx = canvas.getContext("2d");
    const step = document.getElementById("steps");
    let valor = document.getElementById("valor");

    // dibujamos el primer triangulo
    let triangulo = new triangle();
    triangulo.draw_triangle(0, 600, 600, ctx);

    // cambiamos el texto de las subdivisiones
    step.addEventListener('change', ()=> {
        valor.innerHTML = `Subdivisions: ${step.value}`;
        // limpiamos el canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // dependiendo del valor del slider, hacemos un triangulo o muchos triangulos con las funciones importadas
        if(step.value != 0){
            triangulo.draw_sierpinskiTriangle(0, 600, 600, ctx, step.value);
        } else {
            triangulo.draw_triangle(0, 600, 600, ctx);
        }
    })
};

main();