Shader "Procedural/Moon" {
	Properties {
		
		_Color1 ("Primary Color", Color) = (.376,.208,.059,1)
		_Color2 ("Secondary Color", Color) = (.161,.102,.000,1)
		
		_Polish ("Polish", Range(0,4)) = .82
		_Glossiness ("Smoothness", Range(0,1)) = 0.04
		_Metallic ("Metallic", Range(0,1)) = 0.14
		
		_BumpOctaves ("BumpOctaves", Range(1, 8)) = 5.0
		_BumpPersistence ("Bump Persistence", Range(0, 1)) = 1.0
		_BumpScale ("Bumpiness Spread", Range(1.337, 33.37)) = 9.3
		_BumpAmt ("Bumpiness Amount", Range(.01, 4)) = 2.15
		_CraterMax ("CraterMax", Range(0, 1)) = .411
		_CraterMin ("CraterMin", Range(0, 1)) = .14
		_CraterOctaves ("CraterOctaves", Range(2, 9)) = 5
		_CraterShift ("Crater Shift", Vector) = (1,1,1,1)
		_CraterComp ("Crater Compisition", Vector) = (1, 0, 0, 1)
		_CraterLip ("Crater Lip", Range(0, 1)) = .43
		
		_Seed ("Seed", Float) = 31337.1337
		_Octaves ("NoiseOctaves", Range(1, 32)) = 6.0
		_Persistence ("NoisePersistence", Range(0, 1)) = .93
		_Scale ("NoiseScale", Float) = 1
		
		
		_VoroScale ("VoroniScale", Float) = .89
		_DetScale ("Detail Scale", Float) = 4.0
		
		_Parallax ("Parallax ammount", Range(0, .1)) = .02
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
		float _CraterMin;
		float _CraterMax;
		float _CraterPersistence;
		float _CraterLip;
		int _CraterOctaves;
		
		
		fixed4 _Color1;
		fixed4 _Color2;
		
		float _Factor;
		float4 _Offset;
		
		float4 _CraterShift;
		float4 _CraterComp;
		
		
		inline float map(float v, float a, float b, float x, float y) {
			const float p = (v-a) / (b-a);
			return x + (y-x) * clamp(p, 0., 1.);
		}
		
		inline float craterCurve(float v) {
			if (v < _CraterLip) { return (v * v) / (_CraterLip * _CraterLip); }
			return map(v, _CraterLip, 1., 1., _CraterLip);
		}
		
		inline float craters(float3 v) { return voroni(v, _CraterShift.w * _CraterShift.xyz, _CraterComp, VORONI_NORMAL); }
		
		inline float ocraters(float3 pos) {
			float v = 1;
			float frequency = 1.0;
			float amplitude = 1.0;
			//float maxAmplitude = 0;
			
			for (int i = 0; i < _CraterOctaves; i++) {
				float c = craters(pos * frequency);
				if (c < v) { v = c; }
				//maxAmplitude += amplitude;
				//amplitude *= _CraterPersistence;
				frequency *= 2.0; 
			}
			
			return v;
		}
		
		inline float craterSample(float3 pos) {
			return craterCurve(map(ocraters(pos * _VoroScale), _CraterMin, _CraterMax, 0., 1.));
		}

		void surf(Input IN, inout SurfaceOutputStandard o) {
			resetNoise();
			float4 wpos = float4(IN.worldPos, 1);
			float3 pos = mul(unity_WorldToObject, wpos) + _Offset.xyz * _Offset.w;
			//scale = _VoroScale;/
			const float h = craterSample(pos);
			
			pos -= parallax3d(IN, h);
			
			const float v0 = craterSample(pos);
			const float v1 = nnoise(pos * _DetScale);
			/////
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
