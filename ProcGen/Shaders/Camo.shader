Shader "Procedural/Camo" {
	Properties {
		
		[Toggle(SWIZLE_OCTAVES)] _SWIZLE_OCTAVES("Swizle Octaves", Float) = 1
		_Color1 ("Color 1", Color) = (.490,.431,.294,1)
		_Color2 ("Color 2", Color) = (.274,.196,.059,1)
		_Color3 ("Color 3", Color) = (.196,.235,.098,1)
		_Color4 ("Camo Base Color", Color) = (.098, .078, .094, 1)
		
        _Clips ("Clips", Vector) = (1.4, .17, .29, .26)
        _Glossiness ("Smoothness", Range(0,1)) = 0.333
        _Metallic ("Metallic", Range(0,1)) = 0.395
        
        _Seed ("Seed", Float) = 13337.13
        
        _Octaves ("NoiseOctaves", Range(1, 12)) = 4
        _DiffLayers ("Difference Noise Layers", Range(1, 8)) = 3
        _DiffNoiseJump ("Difference Noise Jump", Range(1, 8)) = 2.5
        _Persistence ("NoisePersistence", Range(0, 1)) = .596
        _Scale ("NoiseScale", Float) = 2.15
        
        
        _BumpOctaves ("BumpOctaves", Range(1, 8)) = 5.0
        _BumpScale ("Bumpiness Spread", Range(1.337, 33.37)) = 4.5
        _BumpPersistence ("Bump Persistence", Range(0, 1)) = .579
        _BumpAmt ("Bumpiness Amount", Range(.01, 2)) = 1.46
        
        _Offset ("NoiseOffset (x,y,z) * w", Vector) = (0, 0, 0, 1)
	}
	SubShader {
		Tags { 
			"RenderType"="Opaque" 
			"DisableBatching" = "True" 
		}
		LOD 200
		
		CGPROGRAM
		#pragma surface surf Standard fullforwardshadows
		#pragma target 3.0
		#pragma multi_compile __ SWIZLE_OCTAVES
		
		#include "inc/noiseprims.cginc"
		#include "inc/fbm.cginc"
		#include "inc/fbmnormal.cginc"
		
		struct Input {
			float3 worldPos;
			float3 viewDir;
		};
		
		half _Glossiness;
		half _Metallic;
		fixed4 _Color1;
		fixed4 _Color2;
		fixed4 _Color3;
		fixed4 _Color4;
		int _DiffLayers;
		float _DiffNoiseJump;
		float4 _Offset;
		float4 _Clips;
		
		float diffNoise(float3 pos) {
			float v = nnoise(pos);
			for (int i = 0; i < _DiffLayers; i++) {
				pos.z += _DiffNoiseJump;
				v = abs(v-nnoise(pos));
			}
			return v;
		}
		void surf (Input IN, inout SurfaceOutputStandard o) {
			resetNoise();
			
			float4 wpos = float4(IN.worldPos, 1);
			float3 pos = mul(unity_WorldToObject, wpos);
			pos += _Offset.xyz * _Offset.w;
			
			float4 c;
			float clip4 = diffNoise(pos);
			if (clip4 < _Clips.w) {
				pos.z -= 3.0;
				float clip3 = diffNoise(pos);
				if (clip3 < _Clips.z) {
					pos.z -= 5.0;
					float clip2 = diffNoise(pos);
					if (clip2 > _Clips.y) { c = _Color1; }
					else { c = _Color2; }
				} else { c = _Color3; }
			} else { c = _Color4; }
			
			o.Albedo = c.rgb;
			o.Normal = fbmNormal(pos);
			o.Metallic = _Metallic;
			o.Smoothness = _Glossiness;
			o.Alpha = c.a;
		}
		ENDCG
	} 
	FallBack "Diffuse"
}
