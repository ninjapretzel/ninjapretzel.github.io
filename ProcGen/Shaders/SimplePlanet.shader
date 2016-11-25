// Upgrade NOTE: replaced '_World2Object' with 'unity_WorldToObject'

Shader "Procedural/SimplePlanet" {
	Properties {
		_WaterColor ("Water Color", Color) = (.2, .3, .8, 1)
		_SnowColor ("Snow Color", Color) = (1, 1, 1, 1)
		_GrassColor ("Grass Color", Color) = (.3, .8, .2, 1)
		_DirtColor ("Dirt Color", Color) = (.7, .5, .3, 1)
		
		_WaterCutoff ("Water Level", Range(0, 1)) = .35
		_SnowCaps ("Snow Caps", Range(0, 2)) = 1
		_SnowCapDist ("Snow Caps2", Range(-.5, .5)) = 0
		_SnowCutoff ("Snow Line", Range(0, 1)) = .55
		_SnowMCutoff ("Snow Line 2", Range(0, 1)) = .3
		_GrassCutoff ("Dryness", Range(0, 1)) = .35
		
		_Glossiness ("(Standard) Smoothness", Range(0,1)) = 0.5
		_Metallic ("(Standard) Metallic", Range(0,1)) = 0.0
		
		_Seed ("Seed", Float) = 337.1337
		_Octaves ("NoiseOctaves", Range(1, 32)) = 8.0
		_Persistence ("NoisePersistence", Range(0, 1)) = 1.00
		
		_Scale ("NoiseScale", Float) = 5.0
		_Offset ("NoiseOffset (x,y,z) * w", Vector) = (0, 0, 0, .1)
		
		_Factor ("Noise Factor", Range(0, 1)) = .5
		
		_Parallax ("Parallax ammount", Range(-.02, .02)) = .02
		_Bias ("Parallax bias", Range(0, 2)) = 1
	}
		
	SubShader {
		Tags { 
			"RenderType"="Opaque" 
			"DisableBatching"="True"
		}
		LOD 200
		
		CGPROGRAM
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
		ENDCG
	} 
	FallBack "Diffuse"
}
