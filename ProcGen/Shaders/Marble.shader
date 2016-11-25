// Upgrade NOTE: replaced '_World2Object' with 'unity_WorldToObject'

Shader "Procedural/Marble" {
	Properties {
		_Color ("Primary Color", Color) = (.5,.5,.5,1)
		_Color2 ("Second Color", Color) = (.1,.1,.75,1)
		
		_Glossiness ("Smoothness", Range(0,1)) = 0.5
		_Metallic ("Metallic", Range(0,1)) = 0.0
		
		_BumpOctaves ("BumpOctaves", Range(1, 8)) = 6.0
		_BumpPersistence ("Bump Persistence", Range(0, 1)) = .904
		_BumpScale ("Bumpiness Spread", Range(1.337, 33.37)) = 13.37
		_BumpAmt ("Bumpiness Amount", Range(.01, 4)) = 2
		
		
		[Toggle(SWIZLE_OCTAVES)] _SWIZLE_OCTAVES("Swizle Octaves", Float) = 0
		_Seed ("Seed", Float) = 31337.1337
		_Octaves ("NoiseOctaves", Range(1, 32)) = 8.0
		_Persistence ("NoisePersistence", Range(0, 1)) = .7
		_Scale ("NoiseScale", Float) = 1
		
		_Factor("Factor", Range(0, 1)) = .7
		
		_Parallax ("Parallax ammount", Range(0.0, .50)) = .115
		_Bias ("Parallax bias", Range(-2., 2.)) = 0.5
		
		_Offset ("NoiseOffset (x,y,z) * w", Vector) = (0, 0, 0, 1)
	}
	SubShader {
		Tags { 
			"RenderType"="Opaque"
			"DisableBatching" = "True"
		}
		LOD 200
		
		CGPROGRAM
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
		ENDCG
	} 
	FallBack "Diffuse"
}
