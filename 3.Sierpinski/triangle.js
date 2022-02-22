class triangle {
    // constructor para el triangulo
    constructor(x, y, lado) {
        this.x = x; // coordenadas en x
        this.y = y; // coordenadas en y
        this.lado = lado; // lado del triangulo
    }

    // funcion para dibujar un triangulo
    draw_triangle(x, y, lado, ctx){
        // creamos nuevo path
        ctx.beginPath();
        // (0, 0) comienza en la esquina superior izquierda
        // lo movemos a las coordenadas x, y
        ctx.moveTo(x, y);
        // hacemos una linea del lado inferior izquierdo hacia arriba
        ctx.lineTo(x + (lado / 2), y - (lado * Math.sin(Math.PI / 3)));
        // hacemos una linea de arriba hacia el lado inferior derecho
        ctx.lineTo(x + lado, y);
        // hacemos una linea que regrese al inicio 
        ctx.lineTo(x, y);
        // cerramos el path
        ctx.closePath();
        // llenamos el triangulo del color deseado
        ctx.fillStyle = 'rgba(216, 112, 147, 1)';
        ctx.fill();
    }

    // funcion para dibujar los triangulos
    draw_sierpinskiTriangle(x, y, lado, ctx, divisiones){
        // sacamos el length de la mitad de los lados que seran el length de los nuevos triangulos
        let len_triangulito = lado/2;
        // definimos las posiciones donde estaran los nuevos triangulos a partir del length que definimos
        let pos_triangulito = [x,y, x+(len_triangulito/2), y-(len_triangulito * Math.sin(Math.PI/3)), x+len_triangulito, y];

        // si las divisiones son 0 entonces usamos la funcion para dibujar un triangulo
        if(divisiones === 0){
            this.draw_triangle(x, y, lado, ctx);
        } else {
            // si son mas de 0, entramos al ciclo que va a generar los demas triangulos a partir de la posicion de las mitades de los triangulos
            for(let i=0; i<pos_triangulito.length/2; i++){
                this.draw_sierpinskiTriangle(pos_triangulito[2*i], pos_triangulito[2*i+1], len_triangulito, ctx, divisiones-1);
            }
        }
    }
}

// exportamos la clase triangle
export { 
    triangle 
};