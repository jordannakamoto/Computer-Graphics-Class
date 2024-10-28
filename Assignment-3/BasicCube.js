///////////////////////////////////////////////////////////////////////////////
//
//  BasicCube.js
//
//  A cube defined by 12 triangles with vertices calculated in the shader.
//

class BasicCube {
    constructor(gl, vertexShader, fragmentShader) {

        vertexShader = `
            in vec4 aPosition;
            in vec4 aColor;

            uniform mat4 P;      // Projection matrix
            uniform mat4 MV;     // Model-view matrix

            out vec4 vColor;
            void main() {
                gl_Position = P * MV * aPosition;
                vColor = aColor;
            }
        `;

        fragmentShader ||= `
            in vec4 vColor;
            out vec4 fColor;

            void main() {
                fColor = gl_FrontFacing ? vColor : vec4(0,0,0,0);
            }
        `;

        const s = 0.5;  // Half-size of the cube of side-length 1.0 for centering at origin

        // Define 36 vertices for the cube (12 triangles, 3 vertices each)
        const positions = new Float32Array([
            // Front face
            -s, -s,  s,   s, -s,  s,   s,  s,  s,
            -s, -s,  s,   s,  s,  s,  -s,  s,  s,

            // Back face
            -s, -s, -s,  -s,  s, -s,   s,  s, -s,
            -s, -s, -s,   s,  s, -s,   s, -s, -s,

            // Top face
            -s,  s, -s,  -s,  s,  s,   s,  s,  s,
            -s,  s, -s,   s,  s,  s,   s,  s, -s,

            // Bottom face
            -s, -s, -s,   s, -s, -s,   s, -s,  s,
            -s, -s, -s,   s, -s,  s,  -s, -s,  s,

            // Right face
             s, -s, -s,   s,  s, -s,   s,  s,  s,
             s, -s, -s,   s,  s,  s,   s, -s,  s,

            // Left face
            -s, -s, -s,  -s, -s,  s,  -s,  s,  s,
            -s, -s, -s,  -s,  s,  s,  -s,  s, -s
        ]);

        // Generate unique random colors for each of the 36 vertices
        const colors = generateUniqueColors(36);
        
        let program = new ShaderProgram(gl, this, vertexShader, fragmentShader);

        // Using the Attribute class to create:
        // - position
        // - color
        this.aPosition = new Attribute(gl, program, 'aPosition', positions, 3, gl.FLOAT);
        this.aColor = new Attribute(gl, program, 'aColor', colors, 4, gl.FLOAT);


        this.draw = () => {

            program.use();

            this.aPosition.enable();
            this.aColor.enable();
    
            // Draw the cube with a single call to gl.drawArrays
            gl.drawArrays(gl.TRIANGLES, 0, this.aPosition.count);
    
            this.aPosition.disable();
            this.aColor.disable();
        };
    }
}