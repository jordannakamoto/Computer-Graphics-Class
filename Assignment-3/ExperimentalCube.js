///////////////////////////////////////////////////////////////////////////////
//
//  ExperimentalCube.js
//
//  A procedurally generated cube
//  I don't think this is particularly efficient but it's interesting to me
//

class ExperimentalCube {
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

        const size = 0.5;

        // Generate 8 vertices based on binary pattern
        const vertices = new Float32Array([
            ...(Array.from({ length: 8 }, (_, i) => [
                (i & 1 ? size : -size),
                (i & 2 ? size : -size),
                (i & 4 ? size : -size)
            ])).flat()
        ]);

        // Generate color based on vertex index
        const colors = new Float32Array(
            Array.from({ length: 8 }, (_, i) => [
                (i & 1) ? 1.0 : 0.5,     // R
                (i & 2) ? 1.0 : 0.5,     // G
                (i & 4) ? 1.0 : 0.5,     // B
                1.0                      // A
            ]).flat()
        );

        // Generate Indices
        // Store 4 at a time as a face
        // Process:
        // 1 axis at a time
        // 2 faces on opposite sides of each axis
        // from the point most relative to this side of the axis, shift bits to just add dimensions, creating a unique enumeration
        const faces = [];
        for (let axis = 0; axis < 3; axis++) {
            // Negative side of the current axis (e.g. bottom)
            let startInd = 0 << axis;
            faces.push([
                startInd,
                startInd | (1 << ((axis + 1) % 3)),
                startInd | (1 << ((axis + 1) % 3)) | (1 << ((axis + 2) % 3)), // move along the next and next-next axises to get the third point
                startInd | (1 << ((axis + 2) % 3))
            ]);
        
            // Positive side of the current axis (e.g. top)
            startInd = 1 << axis;
            faces.push([
                startInd,
                startInd | (1 << ((axis + 1) % 3)),
                startInd | (1 << ((axis + 1) % 3)) | (1 << ((axis + 2) % 3)),
                startInd | (1 << ((axis + 2) % 3))
            ]);
        }

        // Group faces into triangles for indexed rendering
        // Adjusting winding order so all are front-facing
        const indices = new Uint16Array(
            faces.flatMap((face, i) => 
                i % 2 === 0  // Reverse winding order for every other face
                ? [face[0], face[3], face[2], face[0], face[2], face[1]] : [face[0], face[1], face[2], face[0], face[2], face[3]]
            )
        );
        
        let program = new ShaderProgram(gl, this, vertexShader, fragmentShader);

        // Using the Attribute class to create:
        // - position
        // - color
        this.aPosition = new Attribute(gl, program, 'aPosition', vertices, 3, gl.FLOAT);
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

            console.log(this.indexBuffer);

            // Bind and draw the elements using indexed rendering
            this.indexBuffer.enable();
            gl.drawElements(gl.TRIANGLES, this.indexBuffer.count, this.indexBuffer.type, 0);
            this.indexBuffer.disable();

            // Disable attributes
            this.aPosition.disable();
            this.aColor.disable();
        };
    }
}