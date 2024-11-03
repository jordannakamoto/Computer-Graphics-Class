///////////////////////////////////////////////////////////////////////////////
//
//  ExperimentalCube.js
//
//  A procedurally generated cube expressed in binary operations
//  Not readable or efficient but it's funny to me.
//
//  s: 1/2 side length
//  v: vertices attribute
//  c: color attribute
//  i: index buffer

class ExperimentalCube {
    constructor(gl, vs, fs) {
        vs = `in vec4 aP; in vec4 aC; uniform mat4 P; uniform mat4 MV; out vec4 vC;void main() { gl_Position = P * MV * aP; vC = aC;}`;
        fs ||= `in vec4 vC;out vec4 fC; void main() { fC = gl_FrontFacing ? vC : vec4(0,0,0,0);}`;
        const s=.5, g=new ShaderProgram(gl,this,vs,fs),
        // generate vertices, colors
        v = new Attribute(gl,g,'aP',new Float32Array([...Array(8)].flatMap((_,i)=>[(i&1?s:-s),(i&2?s:-s),(i&4?s:-s)])),3,gl.FLOAT),
        c = new Attribute(gl,g,'aC',new Float32Array([...Array(8)].flatMap((_,i)=>[(i&1?1:s),(i&2?1:s),(i&4?1:s),1])),4,gl.FLOAT),
        // generate indices as faces by bit shifting around each axis. express winding order by alternating pattern
        i = new Indices(gl,new Uint16Array([...Array(3)].flatMap((_,x)=>{const y=1<<(x+1)%3,z=1<<(x+2)%3;
            return[0|0<<x,z|0<<x,y|z|0<<x,0|0<<x,y|z|0<<x,y|0<<x,1<<x,(1<<x)|y,(1<<x)|y|z,1<<x,(1<<x)|y|z,(1<<x)|z]})));
        this.draw=()=>{g.use();v.enable();c.enable();i.enable();gl.drawElements(gl.TRIANGLES,i.count,i.type,0);i.disable();v.disable();c.disable()};
        }
}