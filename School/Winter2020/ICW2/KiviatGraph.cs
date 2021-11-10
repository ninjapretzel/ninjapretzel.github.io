using UnityEngine;
using System;
using System.Collections;
using System.Collections.Generic;

using static UnityEngine.Mathf;

// This was a script that I used to generate the KiviatGraph in the Unity3d Game Engine.
public class KivatGraph : MonoBehaviour {

	// Data from the problem
	public float[] data = new float[] { 85,15,65,5,90,40,45,20 };
	
	// 
	public Material mat;
	public Color kivatColor = Color.cyan;
	public Color bgColor = Color.gray;
	public Color lineColor = Color.black;
	[Range(.1f, .9f)] public float size = .5f;

	void Awake() {
		mat = new Material(Shader.Find("Unlit/Color"));
		mat.color = Color.white;
	}
	
	void Start() {
		
	}
	
	void OnGUI() {
		int spokes = data.Length;
		Vector3 center = new Vector3(Screen.width / 2f, Screen.height / 2f, 0);
		float radius = Min(Screen.width, Screen.height) / 2f * size;
		
		mat.color = bgColor;
		DrawCircle(24, center, radius, mat);

		mat.color = kivatColor;
		DrawKiviat(data, center, radius, mat);

		mat.color = lineColor;
		DrawLines(data.Length, center, radius, mat);
	}

	static void DrawLines(int spokes, Vector3 center, float radius, Material mat) {

		GL.PushMatrix();
		GL.LoadPixelMatrix();

		mat.SetPass(0);
		GL.Begin(GL.LINES);

		float dangle = 360f / spokes;
		for (int i = 0; i < spokes; i++) {
			float angle = dangle * i;
			float dx = Cos(angle * Deg2Rad);
			float dy = Sin(angle * Deg2Rad);

			GL.Color(Color.white);
			GL.Vertex(center);
			GL.Color(Color.white);
			GL.Vertex(center + new Vector3(dx, dy) * radius);

		}

		GL.End();
		GL.PopMatrix();

	}

	static void DrawKiviat(float[] data, Vector3 center, float radius, Material mat) {
		int spokes = data.Length;
		float dangle = 360f / spokes;
		GL.PushMatrix();
		GL.LoadPixelMatrix();

		mat.SetPass(0);
		GL.Begin(GL.TRIANGLES);
		
		for (int i = 0; i < spokes; i++) {
			float angle = 90 - dangle * i;
			float nextAngle = 90 - dangle * (i + 1);
			float dx1 = Cos(angle * Deg2Rad);
			float dy1 = Sin(angle * Deg2Rad);
			float dx2 = Cos(nextAngle * Deg2Rad);
			float dy2 = Sin(nextAngle * Deg2Rad);

			float p1 = data[i] / 100f;
			float p2 = data[(i + 1) % spokes] / 100f;


			Vector3 out1 = center + new Vector3(dx1, dy1, 0) * (radius);
			Vector3 out2 = center + new Vector3(dx2, dy2, 0) * (radius);
			Vector3 mid1 = center + new Vector3(dx1, dy1, 0) * (p1 * radius);
			Vector3 mid2 = center + new Vector3(dx2, dy2, 0) * (p2 * radius);
			
			GL.Color(Color.white);
			GL.Vertex(mid2);
			GL.Color(Color.white);
			GL.Vertex(center);
			GL.Color(Color.white);
			GL.Vertex(mid1);


		}

		GL.End();
		GL.PopMatrix();
	}

	static void DrawCircle(int sides, Vector3 center, float radius, Material mat) {

		GL.PushMatrix();
		GL.LoadPixelMatrix();

		mat.SetPass(0);
		GL.Begin(GL.TRIANGLES);

		float dangle = 360f / sides;
		for (int i = 0; i < sides; i++) {
			float angle = dangle * i;
			float nextAngle = dangle * (i + 1);
			float dx1 = Cos(angle * Deg2Rad);
			float dy1 = Sin(angle * Deg2Rad);
			float dx2 = Cos(nextAngle * Deg2Rad);
			float dy2 = Sin(nextAngle * Deg2Rad);
			
			Vector3 out1 = center + new Vector3(dx1, dy1, 0) * (radius);
			Vector3 out2 = center + new Vector3(dx2, dy2, 0) * (radius);

			GL.Color(Color.white);
			GL.Vertex(out1);
			GL.Color(Color.white);
			GL.Vertex(center);
			GL.Color(Color.white);
			GL.Vertex(out2);
		}



		GL.End();
		GL.PopMatrix();

	}
	
}
