# WebGL Explorations on the Web
The WebGL sample I chose to examine was on Shadertoy: [Water Coming Out of a Spout](https://www.shadertoy.com/view/lsXGzH).

I am interested in perhaps creating a 3D simulation of sprinkler or irrigation systems and also fluid simulations are really interesting. I don't know much about physics so doing some sort of fluid simulation, even a simple one would probably be good for me to learn and exciting. 

Here is some code analysis from ChatGPT about the implementation of the water physics.

In the shader script provided, the water simulation is not a particle-based system but rather a procedurally generated effect using ray marching and mathematical functions to mimic the behavior of a flowing and rippling water body. Let’s break down the basic physics and techniques used to simulate the water body.

### General Approach to Water Simulation

The shader employs **ray marching** and **signed distance functions (SDFs)** to create the illusion of water. Instead of simulating individual particles, which is common in particle-based water simulations, this shader calculates the appearance of water based on mathematical equations that describe the water’s surface and behavior. Here’s how it works:

1. **Distance Fields for Water Geometry**: 
   The water surface and volume are described using a **signed distance function** (SDF). An SDF returns the shortest distance from a point in space to the closest point on a surface. If the distance is negative, the point is inside the surface; if positive, it is outside.

   - The water surface is defined using the SDF:
   ```glsl
   float fDistWater = (length(vWaterDomain.yz) - kPipeRadius);
   ```
   Here, `fDistWater` calculates the distance from a point to the water surface, defined as a cylinder (`kPipeRadius` is the radius of the pipe, or water body).

2. **Equations of Motion for Water Movement**:
   The shader uses basic physics equations to simulate water movement under gravity or another constant acceleration. These are applied to determine the vertical position and velocity of the water:

   - **Gravity and Parabolic Motion**:
   ```glsl
   float t = max(vWaterDomain.x / kWaterVelocity, 0.0);
   float s = 0.5 * kWaterAccel * t * t;
   float v = -kWaterAccel * t;
   vWaterDomain.y -= s;
   ```
   This code snippet represents the classic equations of motion under uniform acceleration:
   - `s = 0.5 * a * t^2` calculates the displacement, simulating how water falls or rises over time (`a` is the acceleration, `t` is time).
   - The velocity `v` is recalculated as the object (water) falls.
   - `vWaterDomain.y -= s` adjusts the water’s vertical position to reflect this motion, creating a dynamic water surface that appears to move under the influence of gravity.

3. **Noise Functions for Water Surface Details**:
   To simulate the natural appearance of water with waves and ripples, the shader uses noise functions:

   - **Adding Ripples and Waves**:
   ```glsl
   float fNoiseScale = mix(t * t, 1.0 / (1.0 + vNoiseDomain.x), fInTrench) * kWaterNoiseScale;
   fDistWater += Noise(vNoiseDomain) * fNoiseScale;
   ```
   The noise function (`Noise(vNoiseDomain)`) adds pseudo-random variations to the water surface, creating small waves and ripples. The `fNoiseScale` adjusts the intensity of these effects based on the water’s velocity and location (e.g., whether it is in a trench or not).

4. **Dynamic Water Shape and Animation**:
   The shader uses ray marching to simulate a dynamic water surface. The `GetDistanceScene` function, for example, calculates how rays interact with the water’s surface, accounting for reflections, refractions, and transparency:

   - **Ray Marching and Transparency**:
   ```glsl
   vec4 vDistWater = vec4(fDistWater, kMaterialIdWater, vPos.xy);        
   vResult = DistCombineUnionTransparent(vResult, vDistWater, fTransparentScale);
   ```
   Here, `vDistWater` includes the distance to the water surface and its transparency. The `DistCombineUnionTransparent` function calculates the visible effect of overlapping transparent objects, like water.