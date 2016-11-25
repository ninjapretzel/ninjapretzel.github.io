#pragma surface surf Standard vertex:vert_add_wNormal fullforwardshadows
#pragma target 3.0
#pragma multi_compile __ SWIZLE_OCTAVES

#include "inc/noiseprims.cginc"
#include "inc/fbm.cginc"
#include "inc/fbmnormal.cginc"
#include "inc/procheight.cginc"

half _Glossiness;
half _Metallic;
fixed4 _Color;
fixed4 _Color2;
float4 _Offset;
float _Factor;

void surf(Input IN, inout SurfaceOutputStandard o) {
	resetNoise();
	float4 wpos = float4(IN.worldPos, 1);
	float3 pos = mul(unity_WorldToObject, wpos) + _Offset.xyz * _Offset.w;

	float h = nnoise(pos);
	pos += parallax3d(IN, h);

	float v = ( 1 + sin( ( pos.x + nnoise(pos, _Factor) ) * 50 ) ) / 2;
	o.Albedo = lerp(_Color, _Color2, v);

	o.Normal = fbmNormal(pos);

	o.Metallic = _Metallic;
	o.Smoothness = _Glossiness;
	o.Alpha = 1;
}