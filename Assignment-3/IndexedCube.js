///////////////////////////////////////////////////////////////////////////////
//
//  Indexed Cube.js
//
//  A cube defined by 8 unique vertices and using indexed arrays
//

class IndexedCube {
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

        // [Vertices]
        let positions = new Float32Array([
            -s, -s,  s,   // 0: left  | bottom | front
             s, -s,  s,   // 1: right | bottom | front
             s,  s,  s,   // 2: right | top    | front
            -s,  s,  s,   // 3: left  | top    | front
            
            -s, -s, -s,   // 4: left  | bottom | back
             s, -s, -s,   // 5: right | bottom | back
             s,  s, -s,   // 6: right | top    | back
            -s,  s, -s    // 7: left  | top    | back
        ]);

        // [Indices] - 12 triangles (36 indices)
        let indices = new Uint16Array([
            // Front face
            0, 1, 2,   0, 2, 3,
        
            // Back face
            4, 7, 6,   4, 6, 5,
        
            // Top face
            3, 2, 6,   3, 6, 7,
        
            // Bottom face
            0, 4, 5,   0, 5, 1,
        
            // Right face
            1, 5, 6,   1, 6, 2,
        
            // Left face
            0, 3, 7,   0, 7, 4
        ]);
        
        // Generate colors for each of the 8 vertices
        const colors = generateUniqueColors(8);
        
        let program = new ShaderProgram(gl, this, vertexShader, fragmentShader);

        // Using the Attribute class to create:
        // - position
        // - color
        this.aPosition = new Attribute(gl, program, 'aPosition', positions, 3, gl.FLOAT);
        this.aColor = new Attribute(gl, program, 'aColor', colors, 4, gl.FLOAT);

        // [INDEX BUFFER - create and bind]
        this.indexBuffer = new Indices(gl, indices);

        // Locations for updating transformation matrices in `draw`
        this.program = program;

        this.draw = () => {
            this.program.use();

            // Enable position and color attributes
            this.aPosition.enable();
            this.aColor.enable();

            // Bind and draw the elements using indexed rendering
            this.indexBuffer.enable();
            console.log(this.indexBuffer)
            gl.drawElements(gl.TRIANGLES, this.indexBuffer.count, this.indexBuffer.type, 0);
            this.indexBuffer.disable();

            // Disable attributes
            this.aPosition.disable();
            this.aColor.disable();
        };
    }
}