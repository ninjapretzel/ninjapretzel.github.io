#pragma surface surf Standard vertex:vert_add_wNormal fullforwardshadows 
#pragma target 3.0
#pragma multi_compile __ WORLEY
#pragma multi_compile __ WORLDSPACE

#include "inc/procheight.cginc"
#include "inc/noiseprims.cginc"
#include "inc/fbm.cginc"
#include "inc/voroni.cginc"
#include "inc/fbmNormal.cginc"



float _VoroScale;		
float _DetScale;
float _Polish;
half _Glossiness;
half _Metallic;
fixed4 _Color1;
fixed4 _Color2;

float _Factor;
float4 _VoroComp;
float4 _Offset;

float voro(float3 pos) {
	return 
		voroni(pos, float3(1,1,1), _VoroComp,
	#ifdef WORLEY
		VORONI_NORMAL
	#else	
		VORONI_MANHATTAN
	#endif 
		);

}


void surf(Input IN, inout SurfaceOutputStandard o) {
	resetNoise();
	float4 wpos = float4(IN.worldPos, 1);
	#ifdef WORLDSPACE
		float3 pos = wpos;
	#else 
		float3 pos = mul(unity_WorldToObject, wpos);
	#endif
	pos += + _Offset.xyz * _Offset.w;
	//scale = _VoroScale;
	const float h = voro(pos * _VoroScale);

	float3 offset = parallax3d(IN, h);

	pos += offset;

	const float v0 = voro(pos * _VoroScale);
	const float v1 = nnoise(pos * _DetScale);

	o.Albedo = v0 * _Color1 + v1 * _Color2;

	o.Normal = fbmNormal(pos);

	//o.Emission = clamp(2 * abs(IN.wNormal), 0., 1.);
	const float gloss = v0 * _Polish;

	o.Metallic = _Metallic * gloss;
	o.Smoothness = _Glossiness * gloss;
	o.Alpha = 1;
}
