// Upgrade NOTE: replaced '_World2Object' with 'unity_WorldToObject'

Shader "Procedural/VTech3dTransparent" {
	Properties {
		_Color ("Color", Color) = (1,1,1,1)
		
		_MainTex ("Fallback Texture", 2D) = "white" {}
		[Toggle(WORLDSPACE)] _WORLDSPACE("Use worldspace position", Float) = 0
		_Glossiness ("Smoothness", Range(0,1)) = 0.5
		_Metallic ("Metallic", Range(0,1)) = 0.0
		
		[Toggle(SWIZLE_OCTAVES)] _SWIZLE_OCTAVES("Swizle Octaves", Float) = 0
		_Seed ("Seed", Float) = 43758.5453123
		_Seed2 ("Seed2", Float) = 43758.5453123
		_Octaves ("NoiseOctaves", Range(1, 8)) = 4.0
		_Persistence ("NoisePersistence", Range(0, 1)) = .95
		_Scale ("NoiseScale", Float) = 2.0
		
		_Freq ("Frequency Scaling", Float) = 2.0
		_Div ("Brightness Scaling", Float) = 2.0
		_ElectronSpeed ("Electron Speed", Float) = 1.0
		
		_Offset ("NoiseOffset (x,y,z) * w", Vector) = (0, 0, 0, 1)
		_Movement ("Noise movement amount (x,y,z) * w", Vector) = (0, 0, 0, 1)
		_MovementSpeed ("Noise movement speed (x,y,z) * w", Vector) = (0, 0, 0, 1)
	}
	SubShader {
		Tags {
			"Queue"="Transparent" 
			"IgnoreProjector"="True" 
			"RenderType"="Transparent"
			"DisableBatching"="True"
		}
		LOD 200
		CGPROGRAM
			#pragma surface surf StandardSpecular fullforwardshadows alpha:fade
			#pragma target 3.0
			#pragma multi_compile __ WORLDSPACE
			#pragma multi_compile __ SWIZLE_OCTAVES
			
			#include "UnityCG.cginc"
			#include "inc/noiseprims.cginc"
			#include "inc/voroni.cginc"

			struct Input {
				float2 uv_MainTex;
				float3 worldPos;
			};

			half _Glossiness;
			half _Metallic;
			fixed4 _Color;
			float _Factor;
			float _Freq;
			
			float _ElectronSpeed;
			float _Seed2;
			float _Div;
			
			float4 _Offset;
			float4 _Movement;
			float4 _MovementSpeed;
			
			float vtech3(float3 p) {
				float total = 0.0
					, frequency = _Scale
					, amplitude = 1.0
					, maxAmplitude = 0.0;
				const float flicker = 0.4 + .8 * qnoise1(sin(_Time.x));
				
				for (int i = 0; i < _Octaves; i++) {
					seed = _Seed;
					float v1 = voroni3(p * frequency + 5.0);
					float v2 = 0.0;
					seed = _Seed2;
					
					if (i > 0) {
						const float elec = .001 * _ElectronSpeed * _Time.z;
						v2 = voroni3(elec + p * frequency * .5 + 50);
						const float va = 1.0 - smoothstep(0.0, 0.1, v1);
						const float vb = 1.0 - smoothstep(0.0, 0.08, v2);
						const float vpow = va * (0.5 + vb);
						
						total += amplitude * vpow * vpow;
					}
					
					v1 = 1.0 - smoothstep(0.0, 0.3, v1);
					v2 = amplitude * (qnoise1(v1 * 5.5 + 0.1));
					if (i == 0) {
						total += v2 * flicker * flicker;
					} else {
						total += v2;
					}
					
					
					frequency *= _Freq;
					maxAmplitude += amplitude;
					amplitude *= _Persistence;
					
				}
				
				return total / _Div;
			}
			
			void surf(Input IN, inout SurfaceOutputStandardSpecular o) {
				resetNoise();
				
				
				const float4 wpos = float4(IN.worldPos, 1);
				const float3 pos = 
				#ifdef WORLDSPACE
					wpos
				#else 
					mul(unity_WorldToObject, wpos)
				#endif
					+ _Offset.xyz * _Offset.w;
					
				//float v = ( 1 + sin( ( pos.x + nnoise(pos, _Factor) ) * 50 ) ) / 2;
				const float3 ms = _MovementSpeed.xyz * _MovementSpeed.w;
				const float time = _Time.z;
				const float3 mp = 
					float3(sin(time * ms.x), sin(time * ms.y), sin(time * ms.z))
					* (_Movement.xyz * _Movement.w);
				
				const float v = vtech3(pos + mp);
				
				o.Albedo = _Color.xyz * v;
				o.Emission = _Color.xyz * v;
				o.Alpha = _Color.a * v;
			}
		ENDCG
	} 
	Fallback "Legacy Shaders/Transparent/VertexLit"
}
