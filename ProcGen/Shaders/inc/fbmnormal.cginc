#ifndef FBMNORMAL
#define FBMNORMAL

/*
Recommended Properties block additions adjust as necessary.
		_BumpOctaves ("BumpOctaves", Range(1, 8)) = 4.0
		_BumpScale ("Bumpiness Spread", Range(1.337, 33.37)) = 13.37
		_BumpPersistence ("Bump Persistence", Range(0, 1)) = .65
		_BumpAmt ("Bumpiness Amount", Range(.01, 2)) = 1
//*/

int _BumpOctaves;
float _BumpScale;
float _BumpAmt;
float _BumpPersistence;
	
fixed3 fbmNormal(float3 pos) {
	octaves = _BumpOctaves;
	scale = _BumpScale;
	persistence = _BumpPersistence;
	
	const float v1 = nnoise(pos);
	const float v2 = nnoise(pos * 1.5);
	
	const float a = -1 + 2 * v1;
	const float b = -1 + 2 * v2;
	
	const fixed3 n = fixed3(a * _BumpAmt, b * _BumpAmt, 3);
	
	return normalize(n);
}

#endif