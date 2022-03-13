"use strict";

import * as shaderUtils from '../common/shaderUtils.js'
const mat4 = glMatrix.mat4;

let projectionMatrix;

let shaderVertexPositionAttribute, shaderVertexColorAttribute, shaderProjectionMatrixUniform, shaderModelViewMatrixUniform;

const duration = 10000; // ms

// in: Input variables used in the vertex shader. Since the vertex shader is called on each vertex, these will be different every time the vertex shader is invoked.
// Uniforms: Input variables for both the vertex and fragment shaders. These do not change values from vertex to vertex.

const vertexShaderSource = `#version 300 es

        in vec3 vertexPos; // Vertex from the buffer
        in vec4 vertexColor;

        out vec4 color;

        uniform mat4 modelViewMatrix; // Object's position
        uniform mat4 projectionMatrix; // Camera's position

        void main(void) {
    		// Return the transformed and projected vertex value
            gl_Position = projectionMatrix * modelViewMatrix * vec4(vertexPos, 1.0);
            color = vertexColor * 0.8;
        }`;

const fragmentShaderSource = `#version 300 es

        precision mediump float;
        in vec4 color;
        out vec4 fragColor;

        void main(void) {
        fragColor = color;
    }`;

function main() 
{
    const canvas = document.getElementById("webglcanvas");
    const gl = initWebGL(canvas);
    initViewport(gl, canvas);
    initGL(canvas);
    
    let scutoid = createScutoid(gl, [-3.2, 0, -2], [1.0, 1.0, 0.2]);
    let dodecahedron = createDodecahedron(gl, [1 , 0, -2], [-0.4, 1.0, 0.1]);
    let octahedron = createOctahedron(gl, [4.3, 0, -2], [0, 1, 0]);
    
    const shaderProgram = shaderUtils.initShader(gl, vertexShaderSource, fragmentShaderSource);
    bindShaderAttributes(gl, shaderProgram);

    update(gl, shaderProgram, [scutoid, dodecahedron, octahedron]);
}

function initWebGL(canvas)
{
    let gl = null;
    let msg = "Your browser does not support WebGL, or it is not enabled by default.";
    try {
        gl = canvas.getContext("webgl2");
    } 
    catch (e) {
        msg = "Error creating WebGL Context!: " + e.toString();
    }

    if (!gl) {
        throw new Error(msg);
    }

    return gl;        
}

function initViewport(gl, canvas)
{
    gl.viewport(0, 0, canvas.width, canvas.height);
}

function initGL(canvas)
{
    // Create a project matrix with 45 degree field of view
    projectionMatrix = mat4.create();
    
    mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 1, 100);
    // mat4.orthoNO(projectionMatrix, -4, 4, -3.5, 3.5, 1, 100)
    mat4.translate(projectionMatrix, projectionMatrix, [0, 0, -5]);
}

function createScutoid(gl, translation, rotationAxis){
    // Vertex Data
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let verts = [
        // Cara Hexagono
        -1.0, 0.0, 1.5,
        -0.5, -0.87, 1.5,
        0.5, -0.87, 1.5,
        1.0, 0.0, 1.5,
        0.5, 0.87, 1.5,
        -0.5, 0.87, 1.5,

        // Cara Pentagono
        -1.0, 0.0, -1.5,
        -0.31, -0.95, -1.5,
        0.81, -0.59, -1.5,
        0.81, 0.59, -1.5,
        -0.31, 0.95, -1.5,

        // Cara 1
        -1.0, 0.0, 1.5,
        -0.5, -0.87, 1.5,
        -1.0, 0.0, -1.5,
        -0.31, -0.95, -1.5,

        // Cara 2
        -0.5, -0.87, 1.5,
        0.5, -0.87, 1.5,
        -0.31, -0.95, -1.5,
        0.81, -0.59, -1.5,

        // Cara 3
        0.5, -0.87, 1.5,
        1.0, 0.0, 1.5,
        0.81, -0.59, -1.5,
        0.81, 0.59, -1.5,
        0.81, 0.59, 0.0,

        // Cara Triangulo
        1.0, 0.0, 1.5,
        0.5, 0.87, 1.5,
        0.81, 0.59, 0.0,

        // Cara 4
        0.5, 0.87, 1.5,
        -0.5, 0.87, 1.5,
        0.81, 0.59, -1.5,
        -0.31, 0.95, -1.5,
        0.81, 0.59, 0.0,

        // Cara 5
        -0.5, 0.87, 1.5,
        -1.0, 0.0, 1.5,
        -0.31, 0.95, -1.5,
        -1.0, 0.0, -1.5,

    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

    let faceColors = [
        [Math.random(), Math.random(), Math.random(), 1.0], // cara hexagono
        [Math.random(), Math.random(), Math.random(), 1.0], // cara pentagono
        [Math.random(), Math.random(), Math.random(), 1.0], // cara 1
        [Math.random(), Math.random(), Math.random(), 1.0], // cara 2
        [Math.random(), Math.random(), Math.random(), 1.0], // cara 3
        [Math.random(), Math.random(), Math.random(), 1.0], // cara triangulo
        [Math.random(), Math.random(), Math.random(), 1.0], // cara 4
        [Math.random(), Math.random(), Math.random(), 1.0], // cara 5
    ];

    // Each vertex must have the color information
    let vertexColors = [];
    faceColors.forEach((color, i) =>{
        let vertex_num = 0;
        if (i == 0) {
            vertex_num = 6;
        } else if (i == 1 || i == 4 || i == 6) {
            vertex_num = 5;
        } else if  (i == 5) {
            vertex_num = 3;
        } else {
            vertex_num = 4;
        }

        for (let j=0; j < vertex_num; j++) {
            vertexColors.push(...color);
        }
    });

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    let scutoidIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, scutoidIndexBuffer);

    let scutoidIndices = [
        0, 1, 2,      0, 5, 2,      3, 2, 5,    4, 5, 3, // cara hexagono
        6, 7, 8,      8, 10, 6,     8, 9, 10, // cara pentagono
        11, 12, 13,   12, 13, 14, // cara 1
        15, 16, 17,   18, 16, 17, // cara 2
        19, 20, 21,   22, 20, 21,   20, 22, 23, // cara 3
        24, 25, 26, // cara triangulo
        27, 28, 29,   28, 29, 30,   27, 29, 31, // cara 4
        32, 33, 34,   33, 34, 35 // cara 5

    ];

    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(scutoidIndices), gl.STATIC_DRAW);
    
    let scutoid = {
            buffer: vertexBuffer, colorBuffer:colorBuffer, indices:scutoidIndexBuffer,
            vertSize:3, nVerts:36, colorSize:4, nColors:36, nIndices:60,
            primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()
        };

    mat4.translate(scutoid.modelViewMatrix, scutoid.modelViewMatrix, translation);

    scutoid.update = function()
    {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;
    
        // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };
    
    return scutoid;
}

function createDodecahedron(gl, translation, rotationAxis)
{    
    // Vertex Data
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let verts = [
       // Cara 1
       0.8, 0.8,  0.8,
        0.8, 0.8,  -0.8,
        0.5,  1.3,  0,
       1.3,  0,  0.5,
       1.3, 0, -0.5,

       // Cara 2
        0.8, 0.8, 0.8, 
       0.8,  -0.8, 0.8,
        0,  0.5, 1.3,
        0, -0.5, 1.3,
        1.3, 0, 0.5,

       // Cara 3
       0.8,  -0.8, 0.8,
       0.8,  -0.8,  -0.8,
        0.5,  -1.3,  0,
        1.3,  0, 0.5,
        1.3, 0, -0.5,

       // Cara 4
       0.8, 0.8, -0.8,
       0.8, -0.8, -0.8,
       0, 0.5, -1.3,
       0, -0.5, -1.3,
       1.3, 0, -0.5,

       // Cara 5
       0.8, 0.8, -0.8,
       -0.8, 0.8, -0.8,
       0, 0.5, -1.3,
       0.5, 1.3, 0,
       -0.5, 1.3, 0,

       // Cara 6
       0.8, 0.8, 0.8,
       -0.8, 0.8, 0.8,
       0, 0.5, 1.3,
       0.5, 1.3, 0,
       -0.5, 1.3, 0,

       // Cara 7
       -0.8, 0.8, 0.8,
       -0.8, -0.8, 0.8,
       0, 0.5, 1.3,
       0, -0.5, 1.3,
       -1.3, 0, 0.5,

       // Cara 8
       0.8, -0.8, 0.8,
       -0.8, -0.8, 0.8,
       0, -0.5, 1.3,
       0.5, -1.3, 0,
       -0.5, -1.3, 0,

       // Cara 9
       0.8, -0.8, -0.8, 
       -0.8, -0.8, -0.8,
       0, -0.5, -1.3,
       0.5, -1.3, 0,
       -0.5, -1.3, 0,

       // Cara 10
       -0.8, 0.8, -0.8,
       -0.8, -0.8, -0.8,
       0, 0.5, -1.3,
       0, -0.5, -1.3,
       -1.3, 0, -0.5,

       // Cara 11
       -0.8, 0.8, 0.8,
       -0.8, 0.8, -0.8,
       -0.5, 1.3, 0,
       -1.3, 0, 0.5,
       -1.3, 0, -0.5,

       // Cara 12
       -0.8, -0.8, 0.8,
       -0.8, -0.8, -0.8,
       -0.5, -1.3, 0,
       -1.3, 0, 0.5,
       -1.3, 0, -0.5,
       ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

    let faceColors = [
        [Math.random(), Math.random(), Math.random(), 1.0], // cara 1
        [Math.random(), Math.random(), Math.random(), 1.0], // cara 2
        [Math.random(), Math.random(), Math.random(), 1.0], // cara 3
        [Math.random(), Math.random(), Math.random(), 1.0], // cara 4
        [Math.random(), Math.random(), Math.random(), 1.0], // cara 5
        [Math.random(), Math.random(), Math.random(), 1.0], // cara 6
        [Math.random(), Math.random(), Math.random(), 1.0], // cara 7
        [Math.random(), Math.random(), Math.random(), 1.0], // cara 8
        [Math.random(), Math.random(), Math.random(), 1.0], // cara 9
        [Math.random(), Math.random(), Math.random(), 1.0], // cara 10
        [Math.random(), Math.random(), Math.random(), 1.0], // cara 11
        [Math.random(), Math.random(), Math.random(), 1.0], // cara 12
    ];

    // Each vertex must have the color information
    let vertexColors = [];
    faceColors.forEach(color =>{
        for (let j=0; j < 5; j++)
            vertexColors.push(...color);
    });

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    let dodecahedronIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, dodecahedronIndexBuffer);

    let dodecahedronIndices = [
        3, 4, 1,      3, 1, 2,      3, 2, 0,    // cara 1
        8, 9, 6,      9, 8, 7,      9, 7, 5,    // cara 2
        10, 12, 11,   10, 11, 14,   10, 14, 13, // cara 3
        17, 18, 16,   15, 17, 16,   19, 16, 15, // cara 4
        23, 24, 20,   24, 20, 22,   24, 22, 21, // cara 5
        27, 25, 28,   27, 28, 29,   27, 29, 26, // cara 6
        33, 31, 34,   33, 34, 30,   33, 30, 32, // cara 7
        38, 39, 36,   38, 36, 37,   38, 37, 35, // cara 8
        42, 41, 44,   42, 44, 43,   42, 43, 40, // cara 9
        45, 49, 46,   45, 46, 48,   45, 48, 47, // cara 10
        50, 53, 54,   50, 54, 51,   50, 51, 52, // cara 11
        57, 56, 59,   57, 59, 58,   58, 55, 57 // cara 12
    ];

    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(dodecahedronIndices), gl.STATIC_DRAW);
    
    let dodecahedron = {
            buffer: vertexBuffer, colorBuffer:colorBuffer, indices:dodecahedronIndexBuffer,
            vertSize:3, nVerts:60, colorSize:4, nColors: 108, nIndices:108,
            primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()
        };

    mat4.translate(dodecahedron.modelViewMatrix, dodecahedron.modelViewMatrix, translation);

    dodecahedron.update = function()
    {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;
    
        // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };
    
    return dodecahedron;
}

function createOctahedron(gl, translation, rotationAxis){
    // Vertex Data
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let verts = [
        // Cara 1
        -0.9, 0, 0,
        0, -0.9, 0,
        0, 0, 0.9,

        // Cara 2
        -0.9, 0, 0,
        0, 0.9, 0,
        0, 0, 0.9,

        // Cara 3
        0.9, 0, 0,
        0, 0.9, 0,
        0, 0, 0.9,

        // Cara 4
        0.9, 0, 0,
        0, -0.9, 0,
        0, 0, 0.9,

        // Cara 5
        0.9, 0, 0,
        0, -0.9, 0,
        0, 0, -0.9,

        // Cara 6
        -0.9, 0, 0,
        0, -0.9, 0,
        0, 0, -0.9,

        // Cara 7
        -0.9, 0, 0,
        0, 0.9, 0,
        0, 0, -0.9,

        // Cara 8
        0.9, 0, 0,
        0, 0.9, 0,
        0, 0, -0.9,
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

    let faceColors = [
        [Math.random(), Math.random(), Math.random(), 1.0], // cara 1
        [Math.random(), Math.random(), Math.random(), 1.0], // cara 2
        [Math.random(), Math.random(), Math.random(), 1.0], // cara 3
        [Math.random(), Math.random(), Math.random(), 1.0], // cara 4
        [Math.random(), Math.random(), Math.random(), 1.0], // cara 5
        [Math.random(), Math.random(), Math.random(), 1.0], // cara 6
        [Math.random(), Math.random(), Math.random(), 1.0], // cara 7
        [Math.random(), Math.random(), Math.random(), 1.0], // cara 8
    ];

    // Each vertex must have the color information
    let vertexColors = [];
    faceColors.forEach(color =>{
        for (let j=0; j < 3; j++)
            vertexColors.push(...color);
    });

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    let octahedronIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, octahedronIndexBuffer);

    let octahedronIndices = [
        0, 1, 2, // cara 1
        3, 4, 5, // cara 2
        6, 7, 8, // cara 3
        9, 10, 11, // cara 4
        12, 13, 14, // cara 5
        15, 16, 17, // cara 6
        18, 19, 20, // cara 7
        21, 22, 23, // cara 8
    ];

    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(octahedronIndices), gl.STATIC_DRAW);
    
    let octahedron = {
            buffer: vertexBuffer, colorBuffer:colorBuffer, indices:octahedronIndexBuffer,
            vertSize:3, nVerts:24, colorSize:4, nColors:24, nIndices:24,
            primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()
        };

    mat4.translate(octahedron.modelViewMatrix, octahedron.modelViewMatrix, translation);
    
    let cambio = 0;
    let pos_y = 0;
    let mov = 0;

    octahedron.update = function()
    {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;

                // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);

        if(mov == 0){
            if(cambio < 400){
                pos_y = 0.005;
                cambio = cambio + 1;
            } else {
                mov = 1;

            }
        } else {
            if(cambio > -400){
                pos_y = -0.005;
                cambio = cambio - 1;
            } else {
                mov = 0;
            }
        }

        mat4.translate(this.modelViewMatrix, this.modelViewMatrix, [0, pos_y, 0]);

    };
    
    return octahedron;
}


function bindShaderAttributes(gl, shaderProgram)
{
    // get pointers to the shader params
    shaderVertexPositionAttribute = gl.getAttribLocation(shaderProgram, "vertexPos");
    gl.enableVertexAttribArray(shaderVertexPositionAttribute);

    shaderVertexColorAttribute = gl.getAttribLocation(shaderProgram, "vertexColor");
    gl.enableVertexAttribArray(shaderVertexColorAttribute);
    
    shaderProjectionMatrixUniform = gl.getUniformLocation(shaderProgram, "projectionMatrix");
    shaderModelViewMatrixUniform = gl.getUniformLocation(shaderProgram, "modelViewMatrix");
}

function draw(gl, shaderProgram, objs) 
{
    // clear the background (with black)
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    // set the shader to use
    gl.useProgram(shaderProgram);

    for(let i = 0; i< objs.length; i++)
    {
        let obj = objs[i];
        // connect up the shader parameters: vertex position, color and projection/model matrices
        // set up the buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);
        gl.vertexAttribPointer(shaderVertexPositionAttribute, obj.vertSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, obj.colorBuffer);
        gl.vertexAttribPointer(shaderVertexColorAttribute, obj.colorSize, gl.FLOAT, false, 0, 0);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indices);

        gl.uniformMatrix4fv(shaderProjectionMatrixUniform, false, projectionMatrix);
        gl.uniformMatrix4fv(shaderModelViewMatrixUniform, false, obj.modelViewMatrix);

        // Draw the object's primitives using indexed buffer information.
        // void gl.drawElements(mode, count, type, offset);
        // mode: A GLenum specifying the type primitive to render.
        // count: A GLsizei specifying the number of elements to be rendered.
        // type: A GLenum specifying the type of the values in the element array buffer.
        // offset: A GLintptr specifying an offset in the element array buffer.
        gl.drawElements(obj.primtype, obj.nIndices, gl.UNSIGNED_SHORT, 0);
    }
}

function update(gl, shaderProgram, objs) 
{
    // The window.requestAnimationFrame() method tells the browser that you wish to perform an animation and requests that the browser call a specified function to update an animation before the next repaint. The method takes a callback as an argument to be invoked before the repaint.
    requestAnimationFrame(()=> update(gl, shaderProgram, objs));

    draw(gl,shaderProgram, objs);

    objs.forEach(obj =>{
        obj.update();
    })
    // for(const obj of objs)
    //     obj.update();
    // for(let i = 0; i<objs.length; i++)
    //     objs[i].update();
}

main();