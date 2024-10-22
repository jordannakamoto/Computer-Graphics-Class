// > Coding a Vertex Shader

in vec4 aPosition; // a stands for (a)pplication
// ** utilizes global variable

//
// in
//
// ----------------------------------------------------------------
// . Recieves values from the application or preceding shader stage
// ----------------------------------------------------------------


//
// out
//
// ----------------------------------------------------------------
// . Export results from shader to a buffer or subsequent shader stage
// ----------------------------------------------------------------

void main() {
    gl_Position = aPosition;
}

// doesn't return a value

// . gl_Position — contains the position of the current vertex
//   


// vertex shader filed off once for every vertex