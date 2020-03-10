using Microsoft.GotDotNet;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Simulor {

	class Program {
		/// <summary> Hack macro to get the directory the source file is in for easier work inside of IDE. </summary>
		/// <param name="callerPath"> Filled in by compiler. </param>
		/// <returns> Directory of source file calling the method. </returns>
		public static string SourceFileDirectory([CallerFilePath] string callerPath = "[NO PATH]") {
			return callerPath.Substring(0, callerPath.Replace('\\', '/').LastIndexOf('/'));
		}

		/// <summary> Struct to hold color and character information for pretty screen stuff </summary>
		public struct TileData {
			public char c, fg, bg;
			public TileData(char c, char fg, char bg) {
				this.c = c; this.fg = fg; this.bg = bg;
			}
			public void DumpTo(StringBuilder str, char lastFg, char lastBg) {
				if (bg != lastBg) {
					str.Append('%');
					str.Append(bg);
				}

				if (fg != lastFg) {
					str.Append('^');
					str.Append(fg);
				}

				str.Append(c);
			}
		}

		public static void Main(string[] args) {

			Simulation.Configuration config = new Simulation.Configuration();
			// config.seed = 12345;
			Simulation sim = new Simulation(config);

			// Disable ugly cursor boy.
			ConsoleEx.CursorVisible = false;
			int w = Console.WindowWidth;
			//packed tighter for faster drawing
			int h = 3;//Console.WindowHeight; 

			// Initialize screen buffers
			StringBuilder screen = new StringBuilder();
			TileData[] tiles = new TileData[w * h];
			for (int i = 0; i < tiles.Length; i++) {
				tiles[i].c = ' '; // Empty
				tiles[i].fg = '7'; // White
				tiles[i].bg = '0'; // Black
			}


			double timeRate = 64.5;
			double timeout = 0;
			DateTime last = DateTime.UtcNow;
			int lastEvents = 0;
			int steps = 0;
			int statusEvery = 1;

			while (true) {
				DateTime now = DateTime.UtcNow;
				TimeSpan diff = now - last;
				last = now;
				timeout += diff.TotalSeconds * timeRate;
				//Console.WriteLine(timeout);

				while (timeout > 1.0) {
					//Console.WriteLine("--Step");
					timeout -= 1.0;
					steps++;
					sim.TimeStep(1);
					if (steps % statusEvery == 0) {
						//Console.WriteLine($"Status Step {steps}: {sim.customers} customers, {sim.openCounters} counters open.");
					}
				}

				if (lastEvents != sim.events.Count) {
					lastEvents = sim.events.Count;
					// Only redraw if it changes...
					Draw(sim, tiles, screen, w, h);
				}



				if (Console.KeyAvailable) {
					ConsoleKeyInfo keyInfo = Console.ReadKey(true);
					if (keyInfo.Key == ConsoleKey.Escape) {
						break;
					}

				}


				Thread.Sleep(1);
			}

			var data = Json.Reflect(sim.events);
			string dir = SourceFileDirectory();
			DateTime time = DateTime.UtcNow;
			string file = dir + "/" + time.UnixTimestamp();

			//Console.WriteLine("\n\n\n\n\n\n\\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n");
			Console.WriteLine("\nSimulation exiting.\nWriting files:");
			File.WriteAllText(file + "-events.json", data.PrettyPrint());
			Console.WriteLine(file + "-events.json");
			
			JsonObject times = new JsonObject();
			JsonArray waitingTimes = new JsonArray();
			JsonArray inSystemTimes = new JsonArray();
			times["waiting"] = waitingTimes;
			times["inSystem"] = inSystemTimes;
			foreach (var o in sim.events) {
				var begins = o as Simulation.Evt.CustomerServiceBegins;
				if (begins != null) {
					waitingTimes.Add(begins.waitTime);
				}

				var departure = o as Simulation.Evt.CustomerDeparture;
				if (departure != null) {
					inSystemTimes.Add(departure.workTime);
				}
			}
			File.WriteAllText(file + "-times.json", times.PrettyPrint());
			Console.WriteLine(file + "-times.json");

			Console.WriteLine("Done, press any key to exit...");
			Console.Read();
		}

		public static void Draw(Simulation sim, TileData[] tiles, StringBuilder screen, int w, int h) {

			int x = 2;
			int y = 0;
			for (int i = 0; i < sim.counters.Count; i++) {
				var co = sim.counters[i];
				tiles[x + y * w].c = '@';
				tiles[x + y * w].fg = co.open ? 'A' : '9';
				// tiles[x+y*w].bg = co.open ? 'A' : '9';

				tiles[x + y * w + w].c = co.current != null ? 'C' : ' ';


				x += 2;
			}

			x = 0;
			y = 2;
			for (int i = 0; i < w; i++) {
				bool cust = i < sim.queue.Count;
				tiles[x + y * w].c = cust ? 'C' : ' ';
				tiles[x + y * w].bg = '8';
				tiles[x + y * w].fg = '0';
				x++;
			}


			char fg = '\0';
			char bg = '\0';
			for (int i = 0; i < tiles.Length; i++) {
				int xx = i % w;
				int yy = i / w;

				if (i != 0 && i % w == 0) {
					screen.Append('\n');
				}

				TileData tile = tiles[i];

				tile.DumpTo(screen, fg, bg);
				fg = tile.fg;
				bg = tile.bg;
			}

			
			ConsoleEx.Move(0, 0);
			Pretty.Print(screen.ToString());
			screen.Clear();
		}
	}

	public static class DateTimeExtensions {
		private static readonly DateTime epoch = new DateTime(1970, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc);

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public static long UnixTimestamp(this DateTime date) {
			TimeSpan diff = date.ToUniversalTime().Subtract(epoch);
			return (long)diff.TotalMilliseconds;
		}

		public static float TimeUntilNow(this DateTime date) {
			return (float)DateTime.Now.Subtract(date).TotalSeconds;
		}

		//Round a date 'down' to its day
		public static DateTime RoundToDay(this DateTime date) {
			return new DateTime(date.Year, date.Month, date.Day);
		}

		//Round a date 'down' to its hour
		public static DateTime RoundToHour(this DateTime date) {
			return new DateTime(date.Year, date.Month, date.Day, date.Hour, 0, 0);
		}

		//Round a date 'down' to its minute
		public static DateTime RoundToMinute(this DateTime date) {
			return new DateTime(date.Year, date.Month, date.Day, date.Hour, date.Minute, 0);
		}

	}
}
