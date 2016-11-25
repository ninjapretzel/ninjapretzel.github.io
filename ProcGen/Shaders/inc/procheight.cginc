#ifndef PROC_HEIGHT
#define PROC_HEIGHT

/*
Recommended Properties block additions:
		_Parallax ("Parallax ammount", Range(0.0, .50)) = .35
		_Bias ("Parallax bias", Range(-2., 2.)) = .5
//*/

float _Parallax;
float _Bias;

//Has to be named 'Input', apparantly.
//Guess that makes this a bit boiler-platey.
//And also constrains what can be done when this file is included.
struct Input {
	float3 worldPos;
	float3 viewDir;
	float3 wNormal;
};

//Better, condensed parallax for 3d textures.
inline float3 parallax3d(Input IN, float3 h) {
	const float3 nrm = normalize(IN.wNormal);
	const float hv = h * _Parallax - _Parallax * _Bias;
	const float3 eye = normalize(IN.viewDir);
	float3 dir = eye - nrm * dot(eye, nrm) / dot(nrm, nrm);
	return hv * -dir;
}

void vert_add_wNormal(inout appdata_full v, out Input data) {
	UNITY_INITIALIZE_OUTPUT(Input, data);
	data.wNormal = mul((float3x3)unity_ObjectToWorld, v.normal);
}

#endif
