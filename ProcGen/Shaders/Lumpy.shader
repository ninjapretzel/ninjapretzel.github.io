Shader "Procedural/Lumpy" {
	Properties {
		[Toggle(WORLEY)] _WORLEY("Use Worley Noise", Float) = 0
		[Toggle(WORLDSPACE)] _WORLDSPACE("Use worldspace position", Float) = 0
		
		_Color1 ("Primary Color", Color) = (1.,1.,1.,1)
		_Color2 ("Secondary Color", Color) = (.1,.1,.75,1)
		
		_Polish ("Polish", Range(0,4)) = 2
		_Glossiness ("Smoothness", Range(0,1)) = 0.00
		_Metallic ("Metallic", Range(0,1)) = 0.5440
		
		_BumpOctaves ("BumpOctaves", Range(1, 8)) = 6.0
		_BumpPersistence ("Bump Persistence", Range(0, 1)) = .904
		_BumpScale ("Bumpiness Spread", Range(1.337, 33.37)) = 5.8
		_BumpAmt ("Bumpiness Amount", Range(.01, 4)) = 2
		
		_Seed ("Seed", Float) = 31337.1337
		_Octaves ("NoiseOctaves", Range(1, 32)) = 12.0
		_Persistence ("NoisePersistence", Range(0, 1)) = .904
		_Scale ("NoiseScale", Float) = 1
		
		_VoroComp ("Voroni Composition", Vector) = (-1, 1, .3, 1)
		_VoroScale ("VoroniScale", Float) = 7.75
		_DetScale ("Detail Scale", Float) = .4
		
		_Parallax ("Parallax ammount", Range(0, .3)) = .113
		_Bias ("Parallax bias", Range(-2., 2.)) = .5
		
		_Offset ("NoiseOffset (x,y,z) * w", Vector) = (0, 0, 0, 1)
	}
	SubShader {
		Tags { 
			"RenderType"="Opaque" 
			"DisableBatching"="True"
		}
		LOD 200
		
		CGPROGRAM
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
		ENDCG
	}
	
	FallBack "Diffuse"
}
