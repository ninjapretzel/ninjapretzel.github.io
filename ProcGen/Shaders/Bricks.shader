#pragma surface surf Standard vertex:vert_add_wNormal fullforwardshadows
#pragma target 3.0
#pragma multi_compile __ SWIZLE_OCTAVES

#include "inc/noiseprims.cginc"
#include "inc/fbm.cginc"
#include "inc/procheight.cginc"

half _Glossiness;
half _Metallic;

fixed4 _TileColor1;
fixed4 _TileColor2;
fixed4 _TileColor3;
fixed4 _TileColor4;
fixed4 _GroutColor1;
fixed4 _GroutColor2;

float4 _ColorSpread;

float _Factor1;
float _Factor2;
float _BumpFactor;
float _BumpAmt;
float _HeightScale;
float _NormalScale;
float _MortarScale;
float4 _Offset;
float4 _TileSize;
float _TileScale;
float4 _TileOffset;
float4 _TileOffsets;
float4 _TileBlend;
float4 _TileSampleScale;
float4 _TileSampleScale2;
float _TexScale;

float _Borderx;
float _Bordery;

float _ParallaxFactor;

inline float map(float v, float a, float b, float x, float y) {
	const float p = (v-a) / (b-a);
	return x + (y-x) * clamp(p, 0., 1.);
}


void surf (Input IN, inout SurfaceOutputStandard o) {
	resetNoise();

	float4 wpos = float4(IN.worldPos, 1);
	float3 pos;

	pos = mul(unity_WorldToObject, wpos);

	pos += _Offset.xyz * _Offset.w;
	pos *= _TexScale;

	float bvm,bvp,xoff,zoff,bhm,bhp,bdm,bdp,dh,dv,dd;
	float v;

	////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////
	//Calculate tile pattern first time, to detect height
	//Y-Borders
	bvm = floor(pos.y / _TileSize.y) * _TileSize.y;
	bvp = bvm + _TileSize.y;
	xoff = fmod(abs(bvm), _TileSize.x) * _TileOffsets.x;
	zoff = fmod(abs(bvm), _TileSize.z) * _TileOffsets.z;

	//Offset X/Z-Position
	pos.x += xoff;
	pos.z += zoff;
	//X-Borders
	bhm = floor((pos.x) / _TileSize.x) * _TileSize.x;
	bhp = bhm + _TileSize.x;
	//Z-Borders
	bdm = floor((pos.z) / _TileSize.z) * _TileSize.z;
	bdp = bdm + _TileSize.z;

	//Distances
	dh = min(abs(pos.x - bhm), abs(pos.x - bhp)) * _TileSize.x;
	dv = min(abs(pos.y - bvm), abs(pos.y - bvp)) * _TileSize.y;
	dd = min(abs(pos.z - bdm), abs(pos.z - bdp)) * _TileSize.z;

	//Restore X/Z-Position
	pos.x -= xoff;
	pos.z -= zoff;

	//Blend between tile/mortar
	//Make make transition occur over a small range.
	//For fast transition, rather than slow fade.
	v = dv * dh * dd;
	v = map(v, _Borderx, _Bordery, 0., 1.);

	////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////
	//Attempt at Parralax:
	float h = clamp(1-v, -1., 1.) * nnoise(pos * _HeightScale, _ParallaxFactor);
	//if (v > 0) { h = nnoise(pos * _HeightScale, _ParallaxFactor); }
	float3 offset = parallax3d(IN, h);
	pos += offset;

	////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////
	//Calculate tile pattern again, with texture position offset...
	//Y-Borders
	bvm = floor(pos.y / _TileSize.y) * _TileSize.y;
	bvp = bvm + _TileSize.y;
	xoff = fmod(abs(bvm), _TileSize.x) * _TileOffsets.x;
	zoff = fmod(abs(bvm), _TileSize.z) * _TileOffsets.z;

	//Offset X/Z-Position
	pos.x += xoff;
	pos.z += zoff;
	//X-Borders
	bhm = floor((pos.x) / _TileSize.x) * _TileSize.x;
	bhp = bhm + _TileSize.x;
	//Z-Borders
	bdm = floor((pos.z) / _TileSize.z) * _TileSize.z;
	bdp = bdm + _TileSize.z;

	//Distances
	dh = min(abs(pos.x - bhm), abs(pos.x - bhp)) * _TileSize.x;
	dv = min(abs(pos.y - bvm), abs(pos.y - bvp)) * _TileSize.y;
	dd = min(abs(pos.z - bdm), abs(pos.z - bdp)) * _TileSize.z;

	//Restore X/Z-Position
	pos.x -= xoff;
	pos.z -= zoff;

	//Blend between tile/mortar
	//Make make transition occur over a small range.
	//For fast transition, rather than slow fade.
	v = dv * dh * dd;
	v = map(v, _Borderx, _Bordery, 0., 1.);

	//Tile Position
	float3 pt = _TileOffset.xyz * _TileOffset.w 
			+ float3(pos.x, 0., 0.) 
			+ _TileScale * (pos);

	//Tile Sample (blend between tile colors)
	float t = pos.x * _TileSampleScale.x 
			+ pos.y * _TileSampleScale.y
			+ pos.z * _TileSampleScale.z
			+ nnoise(pt * _TileSampleScale2.x, _Factor1) * _TileSampleScale.w;
	t = sin(t * _TileSampleScale2.y) * _TileBlend.z;
	t += _TileBlend.w * nnoise(pt * _TileSampleScale2.z, _Factor2);

	//Tile color
	float4 tc1 = _TileColor1;
	float4 tc2 = _TileColor2;
	float3 cmixCoord = float3(bhm, bvm, bdm) * _ColorSpread.xyz * _ColorSpread.w;
	float cmix = noise(cmixCoord);

	float cmix1 = map(cmix, _TileBlend.x, 0., 0., 1.);
	float cmix2 = map(cmix, _TileBlend.x, 1., 0., 1.);
	if (cmix1 > 0) {
		tc1 = lerp(tc1, _TileColor3, cmix1);
	} else if (cmix2 > 0) {
		tc1 = lerp(tc1, _TileColor4, cmix2);
	}

	float4 tc = lerp(tc1, tc2, t);
	//tc = nnoise(pos);

	//Mortar Position
	float3 pm = _MortarScale * (pos.xzy);
	float m = nnoise(pm, .1);
	float4 mc = lerp(_GroutColor1, _GroutColor2, m) * .8;

	//Tile color
	o.Albedo = lerp(mc, tc, v);

	//Surface normal
	float normalScale = _NormalScale * (1 + v);
	float bumpAmt = _BumpAmt * (.5 + v * .5);


	float a = -1 + 2 * nnoise((pos) * _NormalScale, _BumpFactor);
	float b = -1 + 2 * nnoise((pos) * 1.5 * _NormalScale, _BumpFactor);
	fixed3 n = fixed3(a * bumpAmt,b * bumpAmt,1);
	o.Normal = normalize(n);


	o.Metallic = _Metallic;
	o.Smoothness = _Glossiness;
	o.Alpha = 1.;
}