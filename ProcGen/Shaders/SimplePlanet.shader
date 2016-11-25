#pragma surface surf Standard vertex:vert_add_wNormal fullforwardshadows addshadow
#pragma target 3.0

#include "inc/noiseprims.cginc"
#include "inc/fbm.cginc"
#include "inc/procheight.cginc"

half _Glossiness;
half _Metallic;
fixed4 _Color;

float _SnowCaps;
float _SnowCapDist;
float4 _Offset;

float3 _WaterColor;
float3 _DirtColor;
float3 _GrassColor;
float3 _SnowColor;
float _Factor;

float _WaterCutoff;
float _SnowMCutoff;
float _SnowCutoff;
float _GrassCutoff;

float3 tx(float3 pos) {
	const float3 alt = pos - _Offset.xyz * _Offset.w;
	const float snowAdjust = _SnowCapDist + (alt.y * alt.y) * _SnowCaps;

	const float height = nnoise(pos * .132, _Factor) + snowAdjust;

	const float moisture = nnoise(pos * .143, _Factor) + snowAdjust * .5;



	float x;
	if (height < _WaterCutoff) { //Water
		x = nnoise(pos * 1.55, _Factor);
		//x = onoise(pos * (2.55 + .0004 * sin(_Time.z * .755))
		//	- .001 * _Time.z + .0004 * sin(_Time.z * .535));
		return x * _WaterColor;
	}

	if (height > _SnowCutoff) { //Snow & lava
		if (moisture > _SnowMCutoff) {//snow
			x = .850 - nnoise(pos * 1.4, _Factor) * .4;
			return x * _SnowColor;
		}
		//if (moisture - height < -.3) {//lava
		//	x = onoise(pos * 4.4 + .05 * sin(_Time.x));
		//	return float3(.8 + x*x, .4 + x*x, 0);
		//}

	}

	if (moisture > _GrassCutoff) { //Grass
		x = nnoise(pos * 1.85, _Factor);
		return x * _GrassColor;
	}
	x = nnoise(pos * 1.35, _Factor);
	return x * _DirtColor;
}

inline float map(float v, float a, float b, float x, float y) {
	const float p = (v-a) / (b-a);
	return x + (y-x) * clamp(p, 0., 1.);
}

void surf(Input IN, inout SurfaceOutputStandard o) {
	resetNoise();

	float4 opos = mul(unity_ObjectToWorld, float4(0,0,0,1));

	float4 wpos = float4(IN.worldPos, 1);
	float3 pos = mul(unity_WorldToObject, wpos) + _Offset.xyz * _Offset.w;

	float h = nnoise(pos * .132, _Factor);
	h = map(h, _WaterCutoff, 1., 0., 1.);
	//if (h < _WaterCutoff) { h = _WaterCutoff; }
	float3 offset = parallax3d(IN, h);
	pos += offset;

	o.Albedo = tx(pos);
	//o.Albedo = float3(h,h,h);
	//o.Emission = float3(.5, .5, .5) - .5 * IN.worldNormal;
	o.Metallic = _Metallic;
	o.Smoothness = _Glossiness;

	o.Alpha = 1;
}
