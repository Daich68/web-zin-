// by SamuelYAN
// more works //
   // https://twitter.com/SamuelAnn0924
   // https://www.instagram.com/samuel_yan_1990/

   let theShader;

   function preload() {
       theShader = loadShader('shader.vert', 'shader.frag');
   }

   function setup() {
       // Create canvas inside the canvas-container
       let canvas = createCanvas(windowWidth, windowHeight, WEBGL);
       canvas.parent('canvas-container');
       noStroke();
       pixelDensity(1);
   }

   function draw() {  
     // shader() sets the active shader with our shader
     shader(theShader);
     
     theShader.setUniform("u_resolution", [width, height]);
     theShader.setUniform("u_time", millis() / 1000.0);
     theShader.setUniform("u_frame", frameCount);
     theShader.setUniform("u_mouse", [mouseX, mouseY]);

     // rect gives us some geometry on the screen
     rect(-width/2, -height/2, width, height);
   }

   function windowResized(){
     resizeCanvas(windowWidth, windowHeight);
   }

   // by SamuelYAN
   // more works //
   // https://twitter.com/SamuelAnn0924
   // https://www.instagram.com/samuel_yan_1990/