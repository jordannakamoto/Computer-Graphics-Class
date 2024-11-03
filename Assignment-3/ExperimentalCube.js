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
        const s=.5, g=new ShaderProgram(gl,this,vertexShader,fragmentShader),
        // generate vertices, colors
        v=new Float32Array([...Array(8)].flatMap((_,i)=>[(i&1?s:-s),(i&2?s:-s),(i&4?s:-s)])), a=new Attribute(gl,g,'aPosition',v,3,gl.FLOAT),
        c=new Float32Array([...Array(8)].flatMap((_,i)=>[(i&1?1:.5),(i&2?1:.5),(i&4?1:.5),1])), b=new Attribute(gl,g,'aColor',c,4,gl.FLOAT),
        f=[];
        for(let x=0;x<3;x++){ // generate faces by enumerating off of each axis
            let y=1<<((x+1)%3),z=1<<((x+2)%3);
            f.push([0,y,y|z,z].map(m=>m|0<<x),[1<<x,(1<<x)|y,(1<<x)|y|z,(1<<x)|z]);
        } // define indices and winding order for the faces
        const i=new Uint16Array(f.flatMap((q,n)=>n%2?[q[0],q[1],q[2],q[0],q[2],q[3]]:[q[0],q[3],q[2],q[0],q[2],q[1]])),
              j=new Indices(gl,i);
        this.draw=()=>{g.use();a.enable();b.enable();j.enable();gl.drawElements(gl.TRIANGLES,j.count,j.type,0);j.disable();a.disable();b.disable()};
        }
}