let projectionMatrix = null, shaderProgram = null;

let shaderVertexPositionAttribute = null, shaderVertexColorAttribute = null, shaderProjectionMatrixUniform = null, shaderModelViewMatrixUniform = null;

let mat4 = glMatrix.mat4;

let vertexShaderSource = `#version 300 es
in vec3 vertexPos;
in vec4 vertexColor;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

out vec4 vColor;

void main(void) {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(vertexPos, 1.0);
    vColor = vertexColor * 0.8;
}`;

let fragmentShaderSource = `#version 300 es
    precision mediump float;
    in vec4 vColor;
    out vec4 fragColor;

    void main(void) {
    fragColor = vColor;
}
`;

function createShader(glCtx, str, type)
{
    let shader = null;
    
    if (type == "fragment") 
        shader = glCtx.createShader(glCtx.FRAGMENT_SHADER);
    else if (type == "vertex")
        shader = glCtx.createShader(glCtx.VERTEX_SHADER);
    else
        return null;

    glCtx.shaderSource(shader, str);
    glCtx.compileShader(shader);

    if (!glCtx.getShaderParameter(shader, glCtx.COMPILE_STATUS)) {
        throw new Error(glCtx.getShaderInfoLog(shader));
    }

    return shader;
}

function initShader(glCtx, vertexShaderSource, fragmentShaderSource)
{
    const vertexShader = createShader(glCtx, vertexShaderSource, "vertex");
    const fragmentShader = createShader(glCtx, fragmentShaderSource, "fragment");

    let shaderProgram = glCtx.createProgram();

    glCtx.attachShader(shaderProgram, vertexShader);
    glCtx.attachShader(shaderProgram, fragmentShader);
    glCtx.linkProgram(shaderProgram);
    
    if (!glCtx.getProgramParameter(shaderProgram, glCtx.LINK_STATUS)) {
        throw new Error("Could not initialise shaders");
    }

    return shaderProgram;
}

function initWebGL(canvas) 
{
    let gl = null;
    let msg = "Your browser does not support WebGL, or it is not enabled by default.";

    try 
    {
        gl = canvas.getContext("webgl2");
    } 
    catch (e)
    {
        msg = "Error creating WebGL Context!: " + e.toString();
    }

    if (!gl)
    {
        alert(msg);
        throw new Error(msg);
    }

    return gl;        
}

function initViewport(glCtx, canvas)
{
    glCtx.viewport(0, 0, canvas.width, canvas.height);
}

function initGL(glCtx, canvas)
{
    glCtx.clearColor(0.0, 0.0, 0.0, 1.0);
    glCtx.clear(glCtx.COLOR_BUFFER_BIT);

    projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 1, 5);
}

function draw(glCtx, objs) 
{
    // clear the background (with black)
    glCtx.clearColor(0.1, 0.1, 0.1, 1.0);
    glCtx.enable(glCtx.DEPTH_TEST);
    glCtx.clear(glCtx.COLOR_BUFFER_BIT | glCtx.DEPTH_BUFFER_BIT);

    // set the shader to use
    glCtx.useProgram(shaderProgram);

    for(const obj of objs)
    {
        glCtx.bindBuffer(glCtx.ARRAY_BUFFER, obj.buffer);
        glCtx.vertexAttribPointer(shaderVertexPositionAttribute, obj.vertSize, glCtx.FLOAT, false, 0, 0);

        glCtx.bindBuffer(glCtx.ARRAY_BUFFER, obj.colorBuffer);
        glCtx.vertexAttribPointer(shaderVertexColorAttribute, obj.colorSize, glCtx.FLOAT, false, 0, 0);
        
        glCtx.bindBuffer(glCtx.ELEMENT_ARRAY_BUFFER, obj.indices);

        glCtx.uniformMatrix4fv(shaderProjectionMatrixUniform, false, projectionMatrix);
        glCtx.uniformMatrix4fv(shaderModelViewMatrixUniform, false, obj.modelViewMatrix);

        glCtx.drawElements(obj.primtype, obj.nIndices, glCtx.UNSIGNED_SHORT, 0);
    }
}


function update(glCtx, objs)
{
    requestAnimationFrame(()=>update(glCtx, objs));

    draw(glCtx, objs);
}

function createTriangle(glCtx, translation)
{
    let verts = [
        0, 1, 0,
        -1, -1, 0,
        1, -1, 0
    ];

    let vertexBuffer = glCtx.createBuffer();
    glCtx.bindBuffer(glCtx.ARRAY_BUFFER, vertexBuffer);
    glCtx.bufferData(glCtx.ARRAY_BUFFER, new Float32Array(verts), glCtx.STATIC_DRAW);

    // Color data
    let vertexColors = [
        1, 0, 0, 1,
        0, 1, 0, 1,
        0, 0, 1, 1
    ];
    
    let colorBuffer = glCtx.createBuffer();
    glCtx.bindBuffer(glCtx.ARRAY_BUFFER, colorBuffer);
    glCtx.bufferData(glCtx.ARRAY_BUFFER, new Float32Array(vertexColors), glCtx.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    let triangleIndexBuffer = glCtx.createBuffer();
    glCtx.bindBuffer(glCtx.ELEMENT_ARRAY_BUFFER, triangleIndexBuffer);

    let triangleIndices = [0, 1, 2]

    glCtx.bufferData(glCtx.ELEMENT_ARRAY_BUFFER, new Uint16Array(triangleIndices), glCtx.STATIC_DRAW);
    
    const triangle = {
            buffer: vertexBuffer, colorBuffer:colorBuffer, indices:triangleIndexBuffer,
            vertSize:3, nVerts:verts.length/3, colorSize:4, nColors: vertexColors.length / 3, nIndices: triangleIndices.length,
            primtype:glCtx.TRIANGLES, modelViewMatrix: mat4.create()
        };

    mat4.translate(triangle.modelViewMatrix, triangle.modelViewMatrix, translation);
    
    return triangle;
}

function bindShaderAttributes(glCtx, shaderProgram)
{
    // get pointers to the shader params
    shaderVertexPositionAttribute = glCtx.getAttribLocation(shaderProgram, "vertexPos");
    glCtx.enableVertexAttribArray(shaderVertexPositionAttribute);

    shaderVertexColorAttribute = glCtx.getAttribLocation(shaderProgram, "vertexColor");
    glCtx.enableVertexAttribArray(shaderVertexColorAttribute);
    
    shaderProjectionMatrixUniform = glCtx.getUniformLocation(shaderProgram, "projectionMatrix");
    shaderModelViewMatrixUniform = glCtx.getUniformLocation(shaderProgram, "modelViewMatrix");
}

function main()
{
    let canvas = document.getElementById("webGLCanvas");
    let glCtx = initWebGL(canvas);

    initViewport(glCtx, canvas);
    initGL(glCtx, canvas);

    // las coordenadas estan mal por lo que no se visualizaba el objeto
    //let triangle = createTriangle(glCtx,  [2, -2, 5]);
    let triangle = createTriangle(glCtx,  [0, 0, -4]);

    shaderProgram = initShader(glCtx, vertexShaderSource, fragmentShaderSource);

    bindShaderAttributes(glCtx, shaderProgram);

    update(glCtx, [triangle]);
}

main();