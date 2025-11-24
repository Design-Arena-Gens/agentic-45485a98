'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

interface Player {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  jerseyNumber: string;
  dateOfBirth: string;
  status: string;
}

interface Match {
  id: string;
  title: string;
  opponent: string;
  date: string;
  time: string;
  location: string;
}

interface Tournament {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  status: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [showAddMatch, setShowAddMatch] = useState(false);
  const [showAddTournament, setShowAddTournament] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);

  const [playerForm, setPlayerForm] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    jerseyNumber: '',
    dateOfBirth: '',
    username: '',
    password: '',
  });

  const [matchForm, setMatchForm] = useState({
    title: '',
    opponent: '',
    date: '',
    time: '',
    location: '',
  });

  const [tournamentForm, setTournamentForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    location: '',
    description: '',
    status: 'upcoming',
  });

  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    type: 'training',
  });

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [playersRes, matchesRes, tournamentsRes, eventsRes] = await Promise.all([
        fetch('/api/players'),
        fetch('/api/matches'),
        fetch('/api/tournaments'),
        fetch('/api/events'),
      ]);

      const playersData = await playersRes.json();
      const matchesData = await matchesRes.json();
      const tournamentsData = await tournamentsRes.json();
      const eventsData = await eventsRes.json();

      setPlayers(playersData.players || []);
      setMatches(matchesData.matches || []);
      setTournaments(tournamentsData.tournaments || []);
      setEvents(eventsData.events || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Cookies.remove('token');
    router.push('/login');
  };

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(playerForm),
      });

      if (response.ok) {
        setShowAddPlayer(false);
        setPlayerForm({
          name: '',
          email: '',
          phone: '',
          position: '',
          jerseyNumber: '',
          dateOfBirth: '',
          username: '',
          password: '',
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error adding player:', error);
    }
  };

  const handleDeletePlayer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this player?')) return;

    try {
      await fetch(`/api/players/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting player:', error);
    }
  };

  const handleAddMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...matchForm, playerIds: players.map(p => p.id) }),
      });

      if (response.ok) {
        setShowAddMatch(false);
        setMatchForm({
          title: '',
          opponent: '',
          date: '',
          time: '',
          location: '',
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error adding match:', error);
    }
  };

  const handleAddTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...tournamentForm, playerIds: players.map(p => p.id) }),
      });

      if (response.ok) {
        setShowAddTournament(false);
        setTournamentForm({
          name: '',
          startDate: '',
          endDate: '',
          location: '',
          description: '',
          status: 'upcoming',
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error adding tournament:', error);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...eventForm, playerIds: players.map(p => p.id) }),
      });

      if (response.ok) {
        setShowAddEvent(false);
        setEventForm({
          title: '',
          description: '',
          date: '',
          time: '',
          location: '',
          type: 'training',
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div className="google-loader">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <p style={styles.loadingText}>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logo}>⚽</div>
          <h1 style={styles.title}>Football ERP - Admin</h1>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Logout
        </button>
      </header>

      <div style={styles.main}>
        <nav style={styles.nav}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              ...styles.navBtn,
              ...(activeTab === 'overview' ? styles.navBtnActive : {}),
            }}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('players')}
            style={{
              ...styles.navBtn,
              ...(activeTab === 'players' ? styles.navBtnActive : {}),
            }}
          >
            Players ({players.length})
          </button>
          <button
            onClick={() => setActiveTab('matches')}
            style={{
              ...styles.navBtn,
              ...(activeTab === 'matches' ? styles.navBtnActive : {}),
            }}
          >
            Matches ({matches.length})
          </button>
          <button
            onClick={() => setActiveTab('tournaments')}
            style={{
              ...styles.navBtn,
              ...(activeTab === 'tournaments' ? styles.navBtnActive : {}),
            }}
          >
            Tournaments ({tournaments.length})
          </button>
          <button
            onClick={() => setActiveTab('events')}
            style={{
              ...styles.navBtn,
              ...(activeTab === 'events' ? styles.navBtnActive : {}),
            }}
          >
            Events ({events.length})
          </button>
        </nav>

        <div style={styles.content}>
          {activeTab === 'overview' && (
            <div>
              <h2 style={styles.sectionTitle}>Dashboard Overview</h2>
              <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                  <div style={styles.statIcon}>👥</div>
                  <div style={styles.statValue}>{players.length}</div>
                  <div style={styles.statLabel}>Total Players</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statIcon}>⚽</div>
                  <div style={styles.statValue}>{matches.length}</div>
                  <div style={styles.statLabel}>Matches</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statIcon}>🏆</div>
                  <div style={styles.statValue}>{tournaments.length}</div>
                  <div style={styles.statLabel}>Tournaments</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statIcon}>📅</div>
                  <div style={styles.statValue}>{events.length}</div>
                  <div style={styles.statLabel}>Events</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'players' && (
            <div>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>Player Management</h2>
                <button
                  onClick={() => setShowAddPlayer(true)}
                  style={styles.addBtn}
                >
                  + Add Player
                </button>
              </div>

              {showAddPlayer && (
                <div style={styles.modal}>
                  <div style={styles.modalContent}>
                    <h3 style={styles.modalTitle}>Add New Player</h3>
                    <form onSubmit={handleAddPlayer} style={styles.form}>
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={playerForm.name}
                        onChange={(e) =>
                          setPlayerForm({ ...playerForm, name: e.target.value })
                        }
                        required
                        style={styles.input}
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        value={playerForm.email}
                        onChange={(e) =>
                          setPlayerForm({ ...playerForm, email: e.target.value })
                        }
                        required
                        style={styles.input}
                      />
                      <input
                        type="tel"
                        placeholder="Phone"
                        value={playerForm.phone}
                        onChange={(e) =>
                          setPlayerForm({ ...playerForm, phone: e.target.value })
                        }
                        required
                        style={styles.input}
                      />
                      <input
                        type="text"
                        placeholder="Position"
                        value={playerForm.position}
                        onChange={(e) =>
                          setPlayerForm({ ...playerForm, position: e.target.value })
                        }
                        required
                        style={styles.input}
                      />
                      <input
                        type="text"
                        placeholder="Jersey Number"
                        value={playerForm.jerseyNumber}
                        onChange={(e) =>
                          setPlayerForm({ ...playerForm, jerseyNumber: e.target.value })
                        }
                        required
                        style={styles.input}
                      />
                      <input
                        type="date"
                        placeholder="Date of Birth"
                        value={playerForm.dateOfBirth}
                        onChange={(e) =>
                          setPlayerForm({ ...playerForm, dateOfBirth: e.target.value })
                        }
                        required
                        style={styles.input}
                      />
                      <input
                        type="text"
                        placeholder="Username (for login)"
                        value={playerForm.username}
                        onChange={(e) =>
                          setPlayerForm({ ...playerForm, username: e.target.value })
                        }
                        required
                        style={styles.input}
                      />
                      <input
                        type="password"
                        placeholder="Password"
                        value={playerForm.password}
                        onChange={(e) =>
                          setPlayerForm({ ...playerForm, password: e.target.value })
                        }
                        required
                        style={styles.input}
                      />
                      <div style={styles.modalActions}>
                        <button type="submit" style={styles.submitBtn}>
                          Create Player
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddPlayer(false)}
                          style={styles.cancelBtn}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div style={styles.table}>
                <div style={styles.tableHeader}>
                  <div style={styles.tableCell}>Name</div>
                  <div style={styles.tableCell}>Position</div>
                  <div style={styles.tableCell}>Jersey #</div>
                  <div style={styles.tableCell}>Email</div>
                  <div style={styles.tableCell}>Phone</div>
                  <div style={styles.tableCell}>Status</div>
                  <div style={styles.tableCell}>Actions</div>
                </div>
                {players.map((player) => (
                  <div key={player.id} style={styles.tableRow}>
                    <div style={styles.tableCell}>{player.name}</div>
                    <div style={styles.tableCell}>{player.position}</div>
                    <div style={styles.tableCell}>{player.jerseyNumber}</div>
                    <div style={styles.tableCell}>{player.email}</div>
                    <div style={styles.tableCell}>{player.phone}</div>
                    <div style={styles.tableCell}>
                      <span
                        style={{
                          ...styles.badge,
                          ...(player.status === 'active'
                            ? styles.badgeActive
                            : styles.badgeInactive),
                        }}
                      >
                        {player.status}
                      </span>
                    </div>
                    <div style={styles.tableCell}>
                      <button
                        onClick={() => handleDeletePlayer(player.id)}
                        style={styles.deleteBtn}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'matches' && (
            <div>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>Match Management</h2>
                <button
                  onClick={() => setShowAddMatch(true)}
                  style={styles.addBtn}
                >
                  + Add Match
                </button>
              </div>

              {showAddMatch && (
                <div style={styles.modal}>
                  <div style={styles.modalContent}>
                    <h3 style={styles.modalTitle}>Add New Match</h3>
                    <form onSubmit={handleAddMatch} style={styles.form}>
                      <input
                        type="text"
                        placeholder="Match Title"
                        value={matchForm.title}
                        onChange={(e) =>
                          setMatchForm({ ...matchForm, title: e.target.value })
                        }
                        required
                        style={styles.input}
                      />
                      <input
                        type="text"
                        placeholder="Opponent"
                        value={matchForm.opponent}
                        onChange={(e) =>
                          setMatchForm({ ...matchForm, opponent: e.target.value })
                        }
                        required
                        style={styles.input}
                      />
                      <input
                        type="date"
                        placeholder="Date"
                        value={matchForm.date}
                        onChange={(e) =>
                          setMatchForm({ ...matchForm, date: e.target.value })
                        }
                        required
                        style={styles.input}
                      />
                      <input
                        type="time"
                        placeholder="Time"
                        value={matchForm.time}
                        onChange={(e) =>
                          setMatchForm({ ...matchForm, time: e.target.value })
                        }
                        required
                        style={styles.input}
                      />
                      <input
                        type="text"
                        placeholder="Location"
                        value={matchForm.location}
                        onChange={(e) =>
                          setMatchForm({ ...matchForm, location: e.target.value })
                        }
                        required
                        style={styles.input}
                      />
                      <div style={styles.modalActions}>
                        <button type="submit" style={styles.submitBtn}>
                          Create Match
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddMatch(false)}
                          style={styles.cancelBtn}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div style={styles.grid}>
                {matches.map((match) => (
                  <div key={match.id} style={styles.card}>
                    <h3 style={styles.cardTitle}>{match.title}</h3>
                    <p style={styles.cardText}>Opponent: {match.opponent}</p>
                    <p style={styles.cardText}>
                      Date: {new Date(match.date).toLocaleDateString()}
                    </p>
                    <p style={styles.cardText}>Time: {match.time}</p>
                    <p style={styles.cardText}>Location: {match.location}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tournaments' && (
            <div>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>Tournament Management</h2>
                <button
                  onClick={() => setShowAddTournament(true)}
                  style={styles.addBtn}
                >
                  + Add Tournament
                </button>
              </div>

              {showAddTournament && (
                <div style={styles.modal}>
                  <div style={styles.modalContent}>
                    <h3 style={styles.modalTitle}>Add New Tournament</h3>
                    <form onSubmit={handleAddTournament} style={styles.form}>
                      <input
                        type="text"
                        placeholder="Tournament Name"
                        value={tournamentForm.name}
                        onChange={(e) =>
                          setTournamentForm({ ...tournamentForm, name: e.target.value })
                        }
                        required
                        style={styles.input}
                      />
                      <input
                        type="date"
                        placeholder="Start Date"
                        value={tournamentForm.startDate}
                        onChange={(e) =>
                          setTournamentForm({ ...tournamentForm, startDate: e.target.value })
                        }
                        required
                        style={styles.input}
                      />
                      <input
                        type="date"
                        placeholder="End Date"
                        value={tournamentForm.endDate}
                        onChange={(e) =>
                          setTournamentForm({ ...tournamentForm, endDate: e.target.value })
                        }
                        required
                        style={styles.input}
                      />
                      <input
                        type="text"
                        placeholder="Location"
                        value={tournamentForm.location}
                        onChange={(e) =>
                          setTournamentForm({ ...tournamentForm, location: e.target.value })
                        }
                        required
                        style={styles.input}
                      />
                      <textarea
                        placeholder="Description"
                        value={tournamentForm.description}
                        onChange={(e) =>
                          setTournamentForm({ ...tournamentForm, description: e.target.value })
                        }
                        required
                        style={{ ...styles.input, minHeight: '80px' }}
                      />
                      <select
                        value={tournamentForm.status}
                        onChange={(e) =>
                          setTournamentForm({ ...tournamentForm, status: e.target.value })
                        }
                        style={styles.input}
                      >
                        <option value="upcoming">Upcoming</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option>
                      </select>
                      <div style={styles.modalActions}>
                        <button type="submit" style={styles.submitBtn}>
                          Create Tournament
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddTournament(false)}
                          style={styles.cancelBtn}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div style={styles.grid}>
                {tournaments.map((tournament) => (
                  <div key={tournament.id} style={styles.card}>
                    <h3 style={styles.cardTitle}>{tournament.name}</h3>
                    <p style={styles.cardText}>
                      Start: {new Date(tournament.startDate).toLocaleDateString()}
                    </p>
                    <p style={styles.cardText}>
                      End: {new Date(tournament.endDate).toLocaleDateString()}
                    </p>
                    <p style={styles.cardText}>Location: {tournament.location}</p>
                    <span
                      style={{
                        ...styles.badge,
                        ...(tournament.status === 'upcoming'
                          ? styles.badgeUpcoming
                          : tournament.status === 'ongoing'
                          ? styles.badgeOngoing
                          : styles.badgeCompleted),
                      }}
                    >
                      {tournament.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>Event Management</h2>
                <button
                  onClick={() => setShowAddEvent(true)}
                  style={styles.addBtn}
                >
                  + Add Event
                </button>
              </div>

              {showAddEvent && (
                <div style={styles.modal}>
                  <div style={styles.modalContent}>
                    <h3 style={styles.modalTitle}>Add New Event</h3>
                    <form onSubmit={handleAddEvent} style={styles.form}>
                      <input
                        type="text"
                        placeholder="Event Title"
                        value={eventForm.title}
                        onChange={(e) =>
                          setEventForm({ ...eventForm, title: e.target.value })
                        }
                        required
                        style={styles.input}
                      />
                      <textarea
                        placeholder="Description"
                        value={eventForm.description}
                        onChange={(e) =>
                          setEventForm({ ...eventForm, description: e.target.value })
                        }
                        required
                        style={{ ...styles.input, minHeight: '80px' }}
                      />
                      <input
                        type="date"
                        placeholder="Date"
                        value={eventForm.date}
                        onChange={(e) =>
                          setEventForm({ ...eventForm, date: e.target.value })
                        }
                        required
                        style={styles.input}
                      />
                      <input
                        type="time"
                        placeholder="Time"
                        value={eventForm.time}
                        onChange={(e) =>
                          setEventForm({ ...eventForm, time: e.target.value })
                        }
                        required
                        style={styles.input}
                      />
                      <input
                        type="text"
                        placeholder="Location"
                        value={eventForm.location}
                        onChange={(e) =>
                          setEventForm({ ...eventForm, location: e.target.value })
                        }
                        required
                        style={styles.input}
                      />
                      <select
                        value={eventForm.type}
                        onChange={(e) =>
                          setEventForm({ ...eventForm, type: e.target.value })
                        }
                        style={styles.input}
                      >
                        <option value="training">Training</option>
                        <option value="meeting">Meeting</option>
                        <option value="social">Social</option>
                        <option value="other">Other</option>
                      </select>
                      <div style={styles.modalActions}>
                        <button type="submit" style={styles.submitBtn}>
                          Create Event
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddEvent(false)}
                          style={styles.cancelBtn}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div style={styles.grid}>
                {events.map((event) => (
                  <div key={event.id} style={styles.card}>
                    <h3 style={styles.cardTitle}>{event.title}</h3>
                    <p style={styles.cardText}>
                      Date: {new Date(event.date).toLocaleDateString()}
                    </p>
                    <p style={styles.cardText}>Time: {event.time}</p>
                    <p style={styles.cardText}>Location: {event.location}</p>
                    <span style={styles.badge}>{event.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    background: '#f5f5f5',
  },
  header: {
    background: 'white',
    padding: '16px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  logo: {
    fontSize: '32px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#202124',
  },
  logoutBtn: {
    padding: '10px 20px',
    background: '#ea4335',
    color: 'white',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
  },
  main: {
    display: 'flex',
    minHeight: 'calc(100vh - 64px)',
  },
  nav: {
    width: '250px',
    background: 'white',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  navBtn: {
    padding: '12px 16px',
    background: 'transparent',
    color: '#5f6368',
    textAlign: 'left',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  navBtnActive: {
    background: '#e8f0fe',
    color: '#1a73e8',
  },
  content: {
    flex: 1,
    padding: '32px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#202124',
  },
  addBtn: {
    padding: '12px 24px',
    background: '#1a73e8',
    color: 'white',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px',
    marginTop: '24px',
  },
  statCard: {
    background: 'white',
    padding: '32px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  statIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  statValue: {
    fontSize: '36px',
    fontWeight: '700',
    color: '#1a73e8',
    marginBottom: '8px',
  },
  statLabel: {
    fontSize: '14px',
    color: '#5f6368',
    fontWeight: '500',
  },
  table: {
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    padding: '16px',
    background: '#f8f9fa',
    fontWeight: '600',
    fontSize: '14px',
    color: '#202124',
    borderBottom: '1px solid #dadce0',
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    padding: '16px',
    borderBottom: '1px solid #f1f3f4',
    fontSize: '14px',
    color: '#5f6368',
  },
  tableCell: {
    display: 'flex',
    alignItems: 'center',
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
    display: 'inline-block',
  },
  badgeActive: {
    background: '#e6f4ea',
    color: '#1e8e3e',
  },
  badgeInactive: {
    background: '#fce8e6',
    color: '#c5221f',
  },
  badgeUpcoming: {
    background: '#e8f0fe',
    color: '#1a73e8',
  },
  badgeOngoing: {
    background: '#fef7e0',
    color: '#f9ab00',
  },
  badgeCompleted: {
    background: '#e6f4ea',
    color: '#1e8e3e',
  },
  deleteBtn: {
    padding: '6px 16px',
    background: '#fce8e6',
    color: '#c5221f',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '24px',
  },
  card: {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#202124',
    marginBottom: '12px',
  },
  cardText: {
    fontSize: '14px',
    color: '#5f6368',
    marginBottom: '8px',
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    background: 'white',
    padding: '32px',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '500px',
    maxHeight: '80vh',
    overflow: 'auto',
  },
  modalTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#202124',
    marginBottom: '24px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  input: {
    padding: '12px 16px',
    border: '1px solid #dadce0',
    borderRadius: '6px',
    fontSize: '14px',
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px',
  },
  submitBtn: {
    flex: 1,
    padding: '12px 24px',
    background: '#1a73e8',
    color: 'white',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
  },
  cancelBtn: {
    flex: 1,
    padding: '12px 24px',
    background: '#f1f3f4',
    color: '#5f6368',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: '24px',
  },
  loadingText: {
    fontSize: '16px',
    color: '#5f6368',
  },
};
