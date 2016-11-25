//Nvidia CG include
//Noise Primitives
//Jonathan Cohen
//2016
//Distributed under MIT license
//This content is under the MIT License.

//Requires noiseprims.cginc

//This file defines:
//	(onoise) octave noise
//	(nnoise) normalized octave noise


#ifndef FBM_INCLUDED
#define FBM_INCLUDED


///Octave-3d noise  function
///Output is in range [0...1], but, clusters mostly between .4 and .6
///Use nnoise for values that take up the whole range.
float onoise(float3 pos) {
	float total = 0.0
		, frequency = scale
		, amplitude = 1.0
		, maxAmplitude = 0.0;
	
	for (int i = 0; i < octaves; i++) {
		total += noise(pos * frequency) * amplitude;
		frequency *= 2.0, maxAmplitude += amplitude;
		amplitude *= persistence;
		#if SWIZLE_OCTAVES
		pos = pos.yzx; //Swizle to spread degredation across all axis.
		#endif
	}
	
	
	return total / maxAmplitude;
}



///normalized octave noise function, output is in range [0...1]
///factor parameter controls how 'tight' the noise is.
///Default is (factor = 0.5)
float nnoise(float3 pos, float factor) {
	float total = 0.0
		, frequency = scale
		, amplitude = 1.0
		, maxAmplitude = 0.0;
	
	for (int i = 0; i < octaves; i++) {
		total += noise(pos * frequency) * amplitude;
		frequency *= 2.0, maxAmplitude += amplitude;
		amplitude *= persistence;
		#if SWIZLE_OCTAVES
		pos = pos.yzx; //Swizle to spread degredation across all axis.
		#endif
	}
	
	float avg = maxAmplitude * .5;
	if (factor != 0) {
	float range = avg * clamp(factor, 0, 1);
		float mmin = avg - range;
		float mmax = avg + range;
		
		float val = clamp(total, mmin, mmax);
		return val = (val - mmin) / (mmax - mmin);
	} 
	
	if (total > avg) { return 1; }
	return 0;
}
///Default factor = 0.5
float nnoise(float3 pos) { return nnoise(pos, 0.5); }

#endif