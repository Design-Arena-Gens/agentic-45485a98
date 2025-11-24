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

interface Attendance {
  id: string;
  date: string;
  status: string;
  notes?: string;
}

interface Match {
  id: string;
  title: string;
  opponent: string;
  date: string;
  time: string;
  location: string;
  result?: string;
  score?: string;
}

interface Tournament {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
  status: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: string;
}

export default function PlayerDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

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
      const [userRes, playersRes, attendanceRes, matchesRes, tournamentsRes, eventsRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/players'),
        fetch('/api/attendance'),
        fetch('/api/matches'),
        fetch('/api/tournaments'),
        fetch('/api/events'),
      ]);

      const userData = await userRes.json();
      const playersData = await playersRes.json();
      const attendanceData = await attendanceRes.json();
      const matchesData = await matchesRes.json();
      const tournamentsData = await tournamentsRes.json();
      const eventsData = await eventsRes.json();

      setUser(userData.user);

      // Find the player profile for this user
      const playerProfile = playersData.players?.find((p: Player) => p.id === userData.user.playerId);
      setPlayer(playerProfile);

      setAttendance(attendanceData.attendance || []);
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

  const getAttendanceStats = () => {
    const total = attendance.length;
    const present = attendance.filter(a => a.status === 'present').length;
    const absent = attendance.filter(a => a.status === 'absent').length;
    const late = attendance.filter(a => a.status === 'late').length;
    const attendanceRate = total > 0 ? ((present / total) * 100).toFixed(1) : '0';

    return { total, present, absent, late, attendanceRate };
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
        <p style={styles.loadingText}>Loading your profile...</p>
      </div>
    );
  }

  const stats = getAttendanceStats();

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logo}>⚽</div>
          <h1 style={styles.title}>Football ERP - Player Portal</h1>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Logout
        </button>
      </header>

      <div style={styles.main}>
        <nav style={styles.nav}>
          <button
            onClick={() => setActiveTab('profile')}
            style={{
              ...styles.navBtn,
              ...(activeTab === 'profile' ? styles.navBtnActive : {}),
            }}
          >
            My Profile
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            style={{
              ...styles.navBtn,
              ...(activeTab === 'attendance' ? styles.navBtnActive : {}),
            }}
          >
            Attendance
          </button>
          <button
            onClick={() => setActiveTab('matches')}
            style={{
              ...styles.navBtn,
              ...(activeTab === 'matches' ? styles.navBtnActive : {}),
            }}
          >
            Matches
          </button>
          <button
            onClick={() => setActiveTab('tournaments')}
            style={{
              ...styles.navBtn,
              ...(activeTab === 'tournaments' ? styles.navBtnActive : {}),
            }}
          >
            Tournaments
          </button>
          <button
            onClick={() => setActiveTab('events')}
            style={{
              ...styles.navBtn,
              ...(activeTab === 'events' ? styles.navBtnActive : {}),
            }}
          >
            Events
          </button>
        </nav>

        <div style={styles.content}>
          {activeTab === 'profile' && player && (
            <div>
              <h2 style={styles.sectionTitle}>My Profile</h2>
              <div style={styles.profileCard}>
                <div style={styles.profileHeader}>
                  <div style={styles.profileAvatar}>
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={styles.profileName}>{player.name}</h3>
                    <p style={styles.profilePosition}>{player.position}</p>
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
                </div>

                <div style={styles.profileGrid}>
                  <div style={styles.profileField}>
                    <div style={styles.profileLabel}>Jersey Number</div>
                    <div style={styles.profileValue}>{player.jerseyNumber}</div>
                  </div>
                  <div style={styles.profileField}>
                    <div style={styles.profileLabel}>Email</div>
                    <div style={styles.profileValue}>{player.email}</div>
                  </div>
                  <div style={styles.profileField}>
                    <div style={styles.profileLabel}>Phone</div>
                    <div style={styles.profileValue}>{player.phone}</div>
                  </div>
                  <div style={styles.profileField}>
                    <div style={styles.profileLabel}>Date of Birth</div>
                    <div style={styles.profileValue}>
                      {new Date(player.dateOfBirth).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div style={styles.statsSection}>
                  <h4 style={styles.statsTitle}>Quick Stats</h4>
                  <div style={styles.statsGrid}>
                    <div style={styles.statBox}>
                      <div style={styles.statValue}>{stats.attendanceRate}%</div>
                      <div style={styles.statLabel}>Attendance Rate</div>
                    </div>
                    <div style={styles.statBox}>
                      <div style={styles.statValue}>{matches.length}</div>
                      <div style={styles.statLabel}>Matches</div>
                    </div>
                    <div style={styles.statBox}>
                      <div style={styles.statValue}>{tournaments.length}</div>
                      <div style={styles.statLabel}>Tournaments</div>
                    </div>
                    <div style={styles.statBox}>
                      <div style={styles.statValue}>{events.length}</div>
                      <div style={styles.statLabel}>Events</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div>
              <h2 style={styles.sectionTitle}>My Attendance Record</h2>

              <div style={styles.attendanceStats}>
                <div style={styles.attendanceStat}>
                  <div style={styles.attendanceStatValue}>{stats.total}</div>
                  <div style={styles.attendanceStatLabel}>Total Days</div>
                </div>
                <div style={styles.attendanceStat}>
                  <div style={{ ...styles.attendanceStatValue, color: '#1e8e3e' }}>
                    {stats.present}
                  </div>
                  <div style={styles.attendanceStatLabel}>Present</div>
                </div>
                <div style={styles.attendanceStat}>
                  <div style={{ ...styles.attendanceStatValue, color: '#f9ab00' }}>
                    {stats.late}
                  </div>
                  <div style={styles.attendanceStatLabel}>Late</div>
                </div>
                <div style={styles.attendanceStat}>
                  <div style={{ ...styles.attendanceStatValue, color: '#c5221f' }}>
                    {stats.absent}
                  </div>
                  <div style={styles.attendanceStatLabel}>Absent</div>
                </div>
              </div>

              <div style={styles.table}>
                <div style={styles.tableHeader}>
                  <div style={styles.tableCell}>Date</div>
                  <div style={styles.tableCell}>Status</div>
                  <div style={styles.tableCell}>Notes</div>
                </div>
                {attendance.map((record) => (
                  <div key={record.id} style={styles.tableRow}>
                    <div style={styles.tableCell}>
                      {new Date(record.date).toLocaleDateString()}
                    </div>
                    <div style={styles.tableCell}>
                      <span
                        style={{
                          ...styles.badge,
                          ...(record.status === 'present'
                            ? styles.badgeActive
                            : record.status === 'late'
                            ? styles.badgeLate
                            : styles.badgeInactive),
                        }}
                      >
                        {record.status}
                      </span>
                    </div>
                    <div style={styles.tableCell}>{record.notes || '-'}</div>
                  </div>
                ))}
                {attendance.length === 0 && (
                  <div style={styles.emptyState}>
                    <p>No attendance records yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'matches' && (
            <div>
              <h2 style={styles.sectionTitle}>My Matches</h2>
              <div style={styles.grid}>
                {matches.map((match) => (
                  <div key={match.id} style={styles.card}>
                    <h3 style={styles.cardTitle}>{match.title}</h3>
                    <p style={styles.cardText}>
                      <strong>Opponent:</strong> {match.opponent}
                    </p>
                    <p style={styles.cardText}>
                      <strong>Date:</strong> {new Date(match.date).toLocaleDateString()}
                    </p>
                    <p style={styles.cardText}>
                      <strong>Time:</strong> {match.time}
                    </p>
                    <p style={styles.cardText}>
                      <strong>Location:</strong> {match.location}
                    </p>
                    {match.result && (
                      <p style={styles.cardText}>
                        <strong>Result:</strong> {match.result}
                      </p>
                    )}
                    {match.score && (
                      <p style={styles.cardText}>
                        <strong>Score:</strong> {match.score}
                      </p>
                    )}
                  </div>
                ))}
                {matches.length === 0 && (
                  <div style={styles.emptyState}>
                    <p>No matches scheduled yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'tournaments' && (
            <div>
              <h2 style={styles.sectionTitle}>My Tournaments</h2>
              <div style={styles.grid}>
                {tournaments.map((tournament) => (
                  <div key={tournament.id} style={styles.card}>
                    <h3 style={styles.cardTitle}>{tournament.name}</h3>
                    <p style={styles.cardText}>
                      <strong>Start:</strong>{' '}
                      {new Date(tournament.startDate).toLocaleDateString()}
                    </p>
                    <p style={styles.cardText}>
                      <strong>End:</strong>{' '}
                      {new Date(tournament.endDate).toLocaleDateString()}
                    </p>
                    <p style={styles.cardText}>
                      <strong>Location:</strong> {tournament.location}
                    </p>
                    <p style={styles.cardText}>{tournament.description}</p>
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
                {tournaments.length === 0 && (
                  <div style={styles.emptyState}>
                    <p>No tournaments scheduled yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div>
              <h2 style={styles.sectionTitle}>My Events</h2>
              <div style={styles.grid}>
                {events.map((event) => (
                  <div key={event.id} style={styles.card}>
                    <h3 style={styles.cardTitle}>{event.title}</h3>
                    <p style={styles.cardText}>{event.description}</p>
                    <p style={styles.cardText}>
                      <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}
                    </p>
                    <p style={styles.cardText}>
                      <strong>Time:</strong> {event.time}
                    </p>
                    <p style={styles.cardText}>
                      <strong>Location:</strong> {event.location}
                    </p>
                    <span style={styles.badge}>{event.type}</span>
                  </div>
                ))}
                {events.length === 0 && (
                  <div style={styles.emptyState}>
                    <p>No events scheduled yet</p>
                  </div>
                )}
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
  sectionTitle: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#202124',
    marginBottom: '24px',
  },
  profileCard: {
    background: 'white',
    padding: '32px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  profileHeader: {
    display: 'flex',
    gap: '24px',
    alignItems: 'center',
    marginBottom: '32px',
    paddingBottom: '32px',
    borderBottom: '1px solid #e0e0e0',
  },
  profileAvatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '36px',
    fontWeight: '600',
  },
  profileName: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#202124',
    marginBottom: '4px',
  },
  profilePosition: {
    fontSize: '16px',
    color: '#5f6368',
    marginBottom: '8px',
  },
  profileGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px',
    marginBottom: '32px',
  },
  profileField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  profileLabel: {
    fontSize: '12px',
    color: '#5f6368',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  profileValue: {
    fontSize: '16px',
    color: '#202124',
    fontWeight: '500',
  },
  statsSection: {
    paddingTop: '32px',
    borderTop: '1px solid #e0e0e0',
  },
  statsTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#202124',
    marginBottom: '16px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px',
  },
  statBox: {
    background: '#f8f9fa',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
  },
  statValue: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1a73e8',
    marginBottom: '4px',
  },
  statLabel: {
    fontSize: '12px',
    color: '#5f6368',
    fontWeight: '500',
  },
  attendanceStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px',
    marginBottom: '32px',
  },
  attendanceStat: {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  attendanceStatValue: {
    fontSize: '36px',
    fontWeight: '700',
    color: '#1a73e8',
    marginBottom: '8px',
  },
  attendanceStatLabel: {
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
    gridTemplateColumns: 'repeat(3, 1fr)',
    padding: '16px',
    background: '#f8f9fa',
    fontWeight: '600',
    fontSize: '14px',
    color: '#202124',
    borderBottom: '1px solid #dadce0',
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
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
  badgeLate: {
    background: '#fef7e0',
    color: '#f9ab00',
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
  emptyState: {
    padding: '48px',
    textAlign: 'center',
    color: '#5f6368',
    fontSize: '16px',
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
