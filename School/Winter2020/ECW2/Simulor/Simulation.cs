using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Simulor {

	/// <summary> Extension Methods </summary>
	public static class Helpers {
		/// <summary> Helper rand range function </summary>
		/// <returns> Random int in range [a, b) </returns>
		public static int Range(this Random rand, int a, int b) {
			return a + rand.Next(b-a);
		}
	}

	/// <summary> Class to hold simulation configuration and state, and step time in the simulation </summary>
	public class Simulation {
		/// <summary> Class to hold customer state </summary>
		public class Customer {
			/// <summary> What timestep did the customer arrive at? </summary>
			public int arrivalTime = -1;
			/// <summary> How long the customer needs to be served for before being considered served</summary>
			public int serviceDemands = -1;

			public Customer(int time, int demands) { arrivalTime = time; serviceDemands = demands; }
		}

		/// <summary> Class to hold current counter state </summary>
		public class Counter {
			/// <summary> Current customer </summary>
			public Customer current = null;
			/// <summary> Current time for current task (helping customer time, idle time) </summary>
			public int timeout = 0;
			/// <summary> Is the counter currently open? </summary>
			public bool open = false;
			/// <summary> Is the counter currently transitioning? </summary>
			public bool transition = false;
			/// <summary> What is the time for the transition? </summary>
			public int transitionTime = -1;
		}


		/// <summary> Configuration for a 'record' mode simulation </summary>
		public class Configuration {
			/// <summary> Optional seed override </summary>
			public int seed = 31337;

			/// <summary> How many counters will be simulated </summary>
			public int numCounters = 10;
			/// <summary> How long the queue must be before a new counter opens </summary>
			public int queueSizeForNewCounter = 4;
			/// <summary> How long a counter must idle for before being closed </summary>
			public int idleTimeForClose = 45;

			/// <summary> Chance of a customer arriving per time step. </summary>
			public double customerArrivalChance = 1.0 / 25.0;
			/// <summary> Minimum service demand for a new customer in time steps </summary>
			public int minServiceDemand = 30;
			/// <summary> Maximum service demand for a new customer in time steps </summary>
			public int maxServiceDemand = 150;

			/// <summary> Minimum counter open/close time </summary>
			public int minTransitionTime = 10;
			/// <summary> Maximum counter open/close time </summary>
			public int maxTransitionTime = 20;

		}

		/// <summary> Configuration </summary>
		public Configuration config { get; private set; }
		/// <summary> Current state of queues </summary>
		public Queue<Customer> queue { get; private set; }
		/// <summary> Current states of counters </summary>
		public List<Counter> counters { get; private set; }
		/// <summary> Current observed events </summary>
		public List<object> events { get; private set; }
		/// <summary> Current random number sequence </summary>
		private Random rand;

		/// <summary> Current simulation time </summary>
		public int simTime { get; private set; }

		/// <summary> Current customer count </summary>
		public int customers { get; private set; }

		/// <summary> Current open counters count </summary>
		public int openCounters { get; private set; }

		/// <summary> Object pool of customer objects to re-use </summary>
		private List<Customer> customerPool;
		/// <summary> Get an open Customer object from the pool </summary>
		public Customer GetCustomer(int simTime, int demands) {
			if (customerPool.Count > 0) {
				Customer c = customerPool[customerPool.Count-1];
				customerPool.RemoveAt(customerPool.Count-1);
				c.arrivalTime = simTime;
				c.serviceDemands = demands;
				return c;
			}
			return new Customer(simTime, demands);
		}

		/// <summary> Release a Customer object back into the pool </summary>
		public void ReleaseCustomer(Customer c) {
			customerPool.Add(c);
		}

		/// <summary> Constructs a new simulation with the given configuration. </summary>
		/// <param name="config"> Configuration parameters </param>
		public Simulation(Configuration config) {
			this.config = config;
			//recordMode = true;

			// Initialize counters 
			counters = new List<Counter>();
			for (int i = 0; i < config.numCounters; i++) { counters.Add(new Counter()); }
			counters[0].open = true;
			openCounters = 1;
			customers = 0;
			customerPool = new List<Customer>();

			events = new List<object>();
			queue = new Queue<Customer>();

			rand = new Random(config.seed);
			simTime = 1;
		}


		/// <summary> Forward the simulation by 'deltaTime' steps. </summary>
		/// <param name="deltaTime"> Number of steps to advance by </param>
		public void TimeStep(int deltaTime) {

			// Loop for some number of time steps 
			for (int i = 0; i < deltaTime; i++) {
				// Roll for a new customer 
				double arrivalRoll = rand.NextDouble();
				if (arrivalRoll < config.customerArrivalChance) {
					int demands = rand.Range(config.minServiceDemand, config.maxServiceDemand);
					Customer c = GetCustomer(simTime, demands);
					c.serviceDemands = demands;
					queue.Enqueue(c);

					customers++;
					events.Add(new Evt.CustomerArrival(simTime, demands));
				}

				// Count open counters 
				int numTransitioning = 0;
				for (int k = 0; k < counters.Count; k++) {
					if (counters[k].transition) { numTransitioning++; }
				}
				// Before updating any queues, check to see if the queue has grown too long
				// And there are more counters to open up
				if (queue.Count >= config.queueSizeForNewCounter && numTransitioning == 0) {
					for (int k = 0; k < counters.Count; k++) {

						if (!counters[k].open) {
							Customer c = queue.Dequeue();

							// Begin transition to open
							counters[k].transition = true;
							counters[k].transitionTime = rand.Range(config.minTransitionTime, config.maxServiceDemand);

							counters[k].current = c;
							counters[k].timeout = 0;

							//openCounters++;
							events.Add(new Evt.CounterOpening(simTime));
							events.Add(new Evt.CustomerServiceBegins(c.arrivalTime, simTime));

							break;
						}
					}
				}

				// Count open counters 
				int numOpen = 0;
				for (int k = 0; k < counters.Count; k++) {
					if (counters[k].open) { numOpen++; }
				}

				// Loop over all counters
				for (int k = 0; k < counters.Count; k++) {
					// Skip closed counters 
					Counter co = counters[k];
					// Pass timestep
					co.timeout++;

					if (!co.open) {
						if (!co.transition) { 
							continue; 
						}
					} else {

						if (!co.transition) {


							if (co.current != null) {
								// If this counter is helping someone...
								if (co.timeout >= co.current.serviceDemands) {
									// Done, customer leaves
									Customer cOld = co.current;

									customers--;
									events.Add(new Evt.CustomerDeparture(cOld.arrivalTime, simTime));
									// Return object back to pool
									ReleaseCustomer(cOld);
									co.current = null;
								}
							}

							// Check for someone to help in queue
							if (co.current == null && queue.Count > 0) {
								// If counter has nobody, and there is someone in queue, take them on 
								Customer c = queue.Dequeue();

								events.Add(new Evt.CustomerServiceBegins(c.arrivalTime, simTime));
								co.current = c;
								if (co.transition) {
									events.Add(new Evt.CounterCloseCanceled(simTime));
								}
								co.transition = false;
								co.transitionTime = -1;
								co.timeout = 0;
							} else if (co.current == null && co.timeout >= config.idleTimeForClose) {
								// Don't close unless there is at least one other open counter
								if (numOpen > 1) {
									//co.open = false;
									co.transition = true;
									co.timeout = 0;
									co.transitionTime = rand.Range(config.minTransitionTime, config.maxTransitionTime);
									events.Add(new Evt.CounterClosing(simTime));
								}
							}
						}
					}

					// Update transitioning counters 
					if (co.transition && co.timeout >= co.transitionTime) {
						co.open = !co.open;
						co.transition = false;
						co.timeout = 0;
						co.transitionTime = -1;
						if (co.open) {
							openCounters++;
							numOpen++;
							events.Add(new Evt.CounterOpened(simTime));
						} else {
							openCounters--;
							numOpen--;
							events.Add(new Evt.CounterClosed(simTime));
						}
						
					}

				}

				// Move to next sim time 
				simTime++;
			}


		}
		
		/// <summary> Class containing events that can happen in the system </summary>
		public class Evt {
			/// <summary> Event for customer arrivals </summary>
			public class CustomerArrival {
				public string kind { get { return GetType().Name; } set { } }
				public int arrivalTime;
				public int serviceDemands;
				public CustomerArrival(int time, int demands) { arrivalTime = time; serviceDemands = demands; }
			}
			/// <summary> Event for when customers begin recieving service </summary>
			public class CustomerServiceBegins {
				public string kind { get { return GetType().Name; } set { } }
				public int arrivalTime;
				public int timeServiceBegan;
				public int waitTime;
				public CustomerServiceBegins(int time1, int time2) { arrivalTime = time1; timeServiceBegan = time2; waitTime = time2-time1; }
			}
			/// <summary> Event for when customers have finished being served </summary>
			public class CustomerDeparture {
				public string kind { get { return GetType().Name; } set { } }
				public int arrivalTime;
				public int timeFinished;
				public int workTime;
				public CustomerDeparture(int time1, int time2) { arrivalTime = time1; timeFinished = time2; workTime = time2-time1; }
			}
			/// <summary> Event for when a counter starts opening </summary>
			public class CounterOpening {
				public string kind { get { return GetType().Name; } set { } }
				public int time;
				public CounterOpening(int time) { this.time = time; }
			}
			/// <summary> Event for when a counter is closed due to idling for too long </summary>
			public class CounterClosing {
				public string kind { get { return GetType().Name; } set { } }
				public int time;
				public CounterClosing(int time) { this.time = time; }
			}

			/// <summary> Event for when a counter is actually closed when. </summary>
			public class CounterClosed {
				public string kind { get { return GetType().Name; } set { } }
				public int time;
				public CounterClosed(int time) { this.time = time; }
			}
			/// <summary> Event for when a counter's closing is canceled when a customer arrives. </summary>
			public class CounterCloseCanceled {
				public string kind { get { return GetType().Name; } set { } }
				public int time;
				public CounterCloseCanceled(int time) { this.time = time; }
			}
			/// <summary> Event for when a counter's opening process is finished. </summary>
			public class CounterOpened {
				public string kind { get { return GetType().Name; } set { } }
				public int time;
				public CounterOpened(int time) { this.time = time; }
			}
		}

	}
}
