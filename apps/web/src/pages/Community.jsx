import React, { useState } from 'react';
import * as Icons from 'lucide-react';

const INITIAL_POSTS = [
  {
    id: 'post-1',
    type: 'post',
    author: 'Sarah M.',
    avatarColor: '#ec4899',
    timeAgo: '2h ago',
    content: '🔥 Finished my 7-day hydration challenge!\n\nMaintained 92% hydration consistency this week. Energy levels have visibly normalized during morning routines.',
    likes: 24,
    comments: 7,
    userLiked: false,
  },
  {
    id: 'post-2',
    type: 'challenge',
    author: 'NuraCare Health Team',
    authorBadge: 'Official',
    avatarColor: '#16a34a',
    timeAgo: '5h ago',
    title: '7-Day Hydration Challenge',
    content: 'Reach your daily water target 7 days in a row. Sync with your local wellness group and earn the Hydrated Pioneer badge.',
    likes: 58,
    comments: 14,
    userLiked: true,
    challengeData: {
      participants: 312,
      progressPercent: 80,
      joined: false,
    },
  },
  {
    id: 'post-3',
    type: 'story',
    author: 'Dr. Yared (Wellness Contributor)',
    authorBadge: 'Nutritionist',
    avatarColor: '#8b5cf6',
    timeAgo: '1d ago',
    title: 'Ethiopian Wellness Tip 🇪🇹',
    content: 'How traditional Teff-based meals can fit seamlessly into a balanced nutrition and glycemic control routine. Teff contains resistant starch that supports a diverse microbiome.',
    likes: 92,
    comments: 21,
    userLiked: false,
    storyLinkText: 'Read Full Cultural Nutrition Guide',
  },
  {
    id: 'post-4',
    type: 'announcement',
    author: 'NuraCare Community',
    authorBadge: 'Verified',
    avatarColor: '#0284c7',
    timeAgo: '1d ago',
    title: 'Community Wellness Challenge',
    content: 'New community challenge starting this Monday: "Morning Eskesta & Walk (10,000 steps)". Join your regional group to participate.',
    likes: 41,
    comments: 5,
    userLiked: false,
  },
];

const INITIAL_GROUPS = [
  {
    id: 'grp-1',
    name: 'Running Ethiopia 🇪🇹',
    category: 'Cardio & Athletics',
    icon: '🏃',
    membersCount: '12.4K',
    description: 'For Ethiopian runners sharing routes, morning distance goals, motivation, and regional half-marathons.',
    privacy: 'Public',
    joined: true,
  },
  {
    id: 'grp-2',
    name: 'Addis Fitness 👟',
    category: 'Workouts & Gyms',
    icon: '👟',
    membersCount: '8.2K',
    description: 'Active gym-goers and fitness enthusiasts discussing workout splits, local training centers, and recovery.',
    privacy: 'Public',
    joined: false,
  },
  {
    id: 'grp-3',
    name: 'Healthy Ethiopian Cooking 🥗',
    category: 'Nutrition & Tsom',
    icon: '🥗',
    membersCount: '15.1K',
    description: 'Sharing healthy recipes: high-protein Shiro, low-oil Misir, Telba smoothies, and nutritious fasting meals.',
    privacy: 'Public',
    joined: true,
  },
  {
    id: 'grp-4',
    name: 'Mindfulness & Stress 🧘',
    category: 'Mental Wellness',
    icon: '🧘',
    membersCount: '6.3K',
    description: 'Daily breathwork reflections, meditation tips, stress resilience techniques, and mindful living.',
    privacy: 'Public',
    joined: false,
  },
  {
    id: 'grp-5',
    name: 'Hydration Challenge 💧',
    category: 'Habit Building',
    icon: '💧',
    membersCount: '9.8K',
    description: 'Accountability group for maintaining optimal daily hydration and sharing water tracking milestones.',
    privacy: 'Public',
    joined: false,
  },
  {
    id: 'grp-6',
    name: 'Muscle Building 💪',
    category: 'Strength Training',
    icon: '💪',
    membersCount: '4.5K',
    description: 'Hypertrophy principles, bodyweight calisthenics, and plant-based protein pairing during fasting.',
    privacy: 'Public',
    joined: false,
  },
  {
    id: 'grp-7',
    name: 'Healthy Lifestyle 🌿',
    category: 'General Wellness',
    icon: '🌿',
    membersCount: '11.0K',
    description: 'Holistic wellness tips, restorative sleep routines, and sustainable lifestyle habit changes.',
    privacy: 'Public',
    joined: false,
  },
];

const INITIAL_THREADS = [
  {
    id: 'thread-1',
    senderName: 'Hana T.',
    avatarText: 'HT',
    avatarBg: '#0284c7',
    lastMessage: 'See you at the morning walk tomorrow at Entoto!',
    timeAgo: '2m',
    unreadCount: 1,
    messages: [
      { id: 'm1', sender: 'them', text: 'Hey! Are you still participating in the 10k step challenge?', time: '9:40 AM' },
      { id: 'm2', sender: 'me', text: 'Yes, absolutely! Logged 6,000 steps so far today.', time: '9:42 AM' },
      { id: 'm3', sender: 'them', text: 'See you at the morning walk tomorrow at Entoto!', time: '9:45 AM' },
    ],
  },
  {
    id: 'thread-2',
    senderName: 'Abel K.',
    avatarText: 'AK',
    avatarBg: '#16a34a',
    lastMessage: 'Great job on the hydration challenge!',
    timeAgo: '15m',
    unreadCount: 0,
    messages: [
      { id: 'm20', sender: 'them', text: 'Saw your update on the feed!', time: 'Yesterday' },
      { id: 'm21', sender: 'them', text: 'Great job on the hydration challenge!', time: '10:00 AM' },
    ],
  },
  {
    id: 'thread-3',
    senderName: 'Running Ethiopia',
    avatarText: 'RE',
    avatarBg: '#f59e0b',
    lastMessage: 'New challenge announcement: Weekend 5K group run.',
    timeAgo: '1h',
    unreadCount: 2,
    messages: [
      { id: 'm30', sender: 'them', text: 'Moderator: Please review the route map for Saturday morning.', time: '8:00 AM' },
      { id: 'm31', sender: 'them', text: 'New challenge announcement: Weekend 5K group run.', time: '8:30 AM' },
    ],
  },
];

export default function CommunityPage({ profile }) {
  // Top 3-Section Navigation: Feed | Groups | Messages
  const [activeSection, setActiveSection] = useState('feed');

  // Feed State
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [newPostText, setNewPostText] = useState('');
  const [showPostModal, setShowPostModal] = useState(false);

  // Groups State
  const [groups, setGroups] = useState(INITIAL_GROUPS);

  // Messages State
  const [threads, setThreads] = useState(INITIAL_THREADS);
  const [activeThread, setActiveThread] = useState(INITIAL_THREADS[0]);
  const [chatMessage, setChatMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Privacy Settings
  const [whoCanMessage, setWhoCanMessage] = useState('Group members');
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const toggleLike = (postId) => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          const liked = !p.userLiked;
          return {
            ...p,
            userLiked: liked,
            likes: liked ? p.likes + 1 : p.likes - 1,
          };
        }
        return p;
      })
    );
  };

  const toggleJoinChallenge = (postId) => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id === postId && p.challengeData) {
          const isJoined = !p.challengeData.joined;
          return {
            ...p,
            challengeData: {
              ...p.challengeData,
              joined: isJoined,
              participants: isJoined
                ? p.challengeData.participants + 1
                : p.challengeData.participants - 1,
            },
          };
        }
        return p;
      })
    );
  };

  const toggleGroupJoin = (groupId) => {
    setGroups(prev =>
      prev.map(g => (g.id === groupId ? { ...g, joined: !g.joined } : g))
    );
  };

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newPostText.trim()) return;
    const newPost = {
      id: 'post_' + Date.now(),
      type: 'post',
      author: profile?.name || 'You',
      avatarColor: '#16a34a',
      timeAgo: 'Just now',
      content: newPostText.trim(),
      likes: 0,
      comments: 0,
      userLiked: false,
    };
    setPosts([newPost, ...posts]);
    setNewPostText('');
    setShowPostModal(false);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || !activeThread) return;
    const newMsg = {
      id: 'm_' + Date.now(),
      sender: 'me',
      text: chatMessage.trim(),
      time: 'Just now',
    };

    const updatedThreads = threads.map(t => {
      if (t.id === activeThread.id) {
        return {
          ...t,
          lastMessage: newMsg.text,
          timeAgo: 'Just now',
          messages: [...t.messages, newMsg],
        };
      }
      return t;
    });

    setThreads(updatedThreads);
    setActiveThread(prev => ({
      ...prev,
      lastMessage: newMsg.text,
      messages: [...prev.messages, newMsg],
    }));
    setChatMessage('');
  };

  const filteredThreads = threads.filter(
    t =>
      t.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page active" style={{ maxWidth: 1040, margin: '0 auto', paddingBottom: 60 }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icons.Users size={28} color="var(--green)" /> Community Sanctuary
          </h1>
          <p className="page-subtitle">Connect, share wellness habits, and join community challenges.</p>
        </div>
        <button
          className="btn-outline-sm"
          onClick={() => setShowPrivacyModal(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <Icons.ShieldCheck size={16} color="var(--green)" /> Privacy & Safety
        </button>
      </div>

      {/* Internal 3-Section Top Segmented Navigation */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border)',
          marginBottom: 24,
          background: 'var(--surface)',
          borderRadius: 14,
          padding: 6,
          gap: 8,
        }}
      >
        <button
          onClick={() => setActiveSection('feed')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '12px 18px',
            borderRadius: 10,
            border: 'none',
            background: activeSection === 'feed' ? 'var(--green-light)' : 'transparent',
            color: activeSection === 'feed' ? 'var(--green-dark)' : 'var(--text-muted)',
            fontWeight: activeSection === 'feed' ? 700 : 500,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <Icons.Rss size={18} /> Feed & Stories
        </button>

        <button
          onClick={() => setActiveSection('groups')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '12px 18px',
            borderRadius: 10,
            border: 'none',
            background: activeSection === 'groups' ? 'var(--green-light)' : 'transparent',
            color: activeSection === 'groups' ? 'var(--green-dark)' : 'var(--text-muted)',
            fontWeight: activeSection === 'groups' ? 700 : 500,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <Icons.Users size={18} /> Wellness Groups ({groups.length})
        </button>

        <button
          onClick={() => setActiveSection('messages')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '12px 18px',
            borderRadius: 10,
            border: 'none',
            background: activeSection === 'messages' ? 'var(--green-light)' : 'transparent',
            color: activeSection === 'messages' ? 'var(--green-dark)' : 'var(--text-muted)',
            fontWeight: activeSection === 'messages' ? 700 : 500,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <Icons.MessageSquare size={18} /> Messages
          {threads.reduce((a, b) => a + b.unreadCount, 0) > 0 && (
            <span
              style={{
                background: '#ef4444',
                color: '#fff',
                fontSize: 11,
                fontWeight: 700,
                borderRadius: 10,
                padding: '2px 7px',
              }}
            >
              {threads.reduce((a, b) => a + b.unreadCount, 0)}
            </span>
          )}
        </button>
      </div>

      {/* SECTION 1: FEED */}
      {activeSection === 'feed' && (
        <div>
          {/* Post Composer Card */}
          <div
            className="dash-card"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20,
              padding: '16px 20px',
              cursor: 'pointer',
            }}
            onClick={() => setShowPostModal(true)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  background: 'var(--green)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                }}
              >
                {profile?.name ? profile.name[0].toUpperCase() : 'U'}
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                Share a wellness milestone or habit encouragement...
              </span>
            </div>
            <button className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>
              + Share
            </button>
          </div>

          {/* Privacy Notice Banner */}
          <div
            style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: 12,
              padding: '12px 18px',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 13,
              color: '#166534',
            }}
          >
            <Icons.ShieldCheck size={18} color="#16a34a" />
            <span>
              <strong>Privacy Assurance:</strong> Medications, clinical diagnoses, and daily checkup ratings are permanently private and never shared to the community.
            </span>
          </div>

          {/* Posts Stream */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {posts.map(post => (
              <div key={post.id} className="dash-card" style={{ padding: 22 }}>
                {/* Author row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 21,
                      backgroundColor: post.avatarColor,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                    }}
                  >
                    {post.author.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <strong style={{ fontSize: 15 }}>{post.author}</strong>
                      {post.authorBadge && (
                        <span
                          style={{
                            background: 'var(--green-light)',
                            color: 'var(--green-dark)',
                            fontSize: 11,
                            padding: '2px 8px',
                            borderRadius: 8,
                            fontWeight: 700,
                          }}
                        >
                          {post.authorBadge}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{post.timeAgo}</span>
                  </div>
                </div>

                {/* Title if present */}
                {post.title && (
                  <h3 style={{ margin: '0 0 8px 0', fontSize: 17, color: 'var(--text)' }}>
                    {post.title}
                  </h3>
                )}

                {/* Body Content */}
                <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text)', whiteSpace: 'pre-line', margin: '0 0 16px 0' }}>
                  {post.content}
                </p>

                {/* Challenge Card */}
                {post.challengeData && (
                  <div
                    style={{
                      background: 'var(--surface-light, #f8fafc)',
                      border: '1px solid var(--border)',
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 16,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                      <span>👥 {post.challengeData.participants} participants</span>
                      <strong style={{ color: 'var(--green)' }}>{post.challengeData.progressPercent}% Target</strong>
                    </div>
                    <div style={{ height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
                      <div style={{ height: '100%', width: `${post.challengeData.progressPercent}%`, background: 'var(--green)' }} />
                    </div>
                    <button
                      onClick={() => toggleJoinChallenge(post.id)}
                      className={post.challengeData.joined ? 'btn-outline-sm' : 'btn-primary'}
                      style={{ padding: '8px 18px', fontSize: 13 }}
                    >
                      {post.challengeData.joined ? 'Joined Challenge ✓' : 'Join Challenge'}
                    </button>
                  </div>
                )}

                {/* Post Footer Actions */}
                <div style={{ display: 'flex', gap: 24, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                  <button
                    onClick={() => toggleLike(post.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      cursor: 'pointer',
                      color: post.userLiked ? '#ef4444' : 'var(--text-muted)',
                      fontWeight: 600,
                    }}
                  >
                    <Icons.Heart size={18} fill={post.userLiked ? '#ef4444' : 'transparent'} />
                    {post.likes}
                  </button>

                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      fontWeight: 600,
                    }}
                  >
                    <Icons.MessageCircle size={18} />
                    {post.comments} Comments
                  </button>

                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      fontWeight: 600,
                    }}
                  >
                    <Icons.Share2 size={18} />
                    Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: GROUPS */}
      {activeSection === 'groups' && (
        <div>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 20, margin: '0 0 6px 0' }}>Ethiopian Wellness Communities</h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
              Join topic-focused groups to stay motivated and share routines.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: 16 }}>
            {groups.map(g => (
              <div key={g.id} className="dash-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 20 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 32 }}>{g.icon}</span>
                    <span
                      style={{
                        fontSize: 11,
                        background: 'var(--surface-light, #f1f5f9)',
                        padding: '4px 8px',
                        borderRadius: 8,
                        fontWeight: 600,
                        color: 'var(--text-muted)',
                      }}
                    >
                      {g.privacy}
                    </span>
                  </div>

                  <h3 style={{ margin: '0 0 4px 0', fontSize: 17 }}>{g.name}</h3>
                  <div style={{ fontSize: 12, color: 'var(--green-dark)', fontWeight: 600, marginBottom: 8 }}>
                    {g.category} • {g.membersCount} members
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                    {g.description}
                  </p>
                </div>

                <button
                  onClick={() => toggleGroupJoin(g.id)}
                  className={g.joined ? 'btn-outline-sm' : 'btn-primary'}
                  style={{ marginTop: 18, width: '100%', justifyContent: 'center' }}
                >
                  {g.joined ? 'Joined Community ✓' : 'Join Group'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: MESSAGES */}
      {activeSection === 'messages' && (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20, minHeight: 460 }}>
          {/* Threads List */}
          <div className="dash-card" style={{ padding: 16 }}>
            <div style={{ position: 'relative', marginBottom: 14 }}>
              <Icons.Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {filteredThreads.map(t => (
                <div
                  key={t.id}
                  onClick={() => setActiveThread(t)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: 10,
                    borderRadius: 10,
                    cursor: 'pointer',
                    background: activeThread?.id === t.id ? 'var(--green-light)' : 'transparent',
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: t.avatarBg,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    {t.avatarText}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: 14 }}>{t.senderName}</strong>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.timeAgo}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.lastMessage}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Conversation Pane */}
          {activeThread ? (
            <div className="dash-card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
              {/* Header */}
              <div
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: activeThread.avatarBg,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                  }}
                >
                  {activeThread.avatarText}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: 15 }}>{activeThread.senderName}</h4>
                  <span style={{ fontSize: 11, color: 'var(--green-dark)' }}>Active now • Encrypted channel</span>
                </div>
              </div>

              {/* Messages scroll */}
              <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', gap: 10, minHeight: 280 }}>
                {activeThread.messages.map(m => (
                  <div
                    key={m.id}
                    style={{
                      alignSelf: m.sender === 'me' ? 'flex-end' : 'flex-start',
                      background: m.sender === 'me' ? 'var(--green)' : 'var(--surface-light, #f1f5f9)',
                      color: m.sender === 'me' ? '#fff' : 'var(--text)',
                      padding: '10px 16px',
                      borderRadius: 14,
                      maxWidth: '75%',
                      fontSize: 13,
                    }}
                  >
                    <div>{m.text}</div>
                    <div
                      style={{
                        fontSize: 10,
                        opacity: 0.7,
                        marginTop: 4,
                        textAlign: m.sender === 'me' ? 'right' : 'left',
                      }}
                    >
                      {m.time}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Bar */}
              <form
                onSubmit={handleSendMessage}
                style={{
                  display: 'flex',
                  padding: 12,
                  borderTop: '1px solid var(--border)',
                  gap: 10,
                }}
              >
                <input
                  type="text"
                  placeholder="Write a supportive message..."
                  value={chatMessage}
                  onChange={e => setChatMessage(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: 20,
                    border: '1px solid var(--border)',
                    outline: 'none',
                    fontSize: 13,
                  }}
                />
                <button className="btn-primary" type="submit" style={{ borderRadius: 20, padding: '8px 18px' }}>
                  Send
                </button>
              </form>
            </div>
          ) : (
            <div className="dash-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              Select a conversation to start messaging.
            </div>
          )}
        </div>
      )}

      {/* Post Modal */}
      {showPostModal && (
        <div className="modal-overlay open" onClick={() => setShowPostModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <h3 style={{ margin: '0 0 12px 0' }}>Share Wellness Milestone</h3>
            <textarea
              placeholder="What healthy habit or milestone are you celebrating?"
              value={newPostText}
              onChange={e => setNewPostText(e.target.value)}
              style={{
                width: '100%',
                minHeight: 120,
                padding: 12,
                borderRadius: 10,
                border: '1px solid var(--border)',
                fontFamily: 'inherit',
                fontSize: 14,
                marginBottom: 14,
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button className="btn-outline-sm" onClick={() => setShowPostModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleCreatePost}>
                Publish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Settings Modal */}
      {showPrivacyModal && (
        <div className="modal-overlay open" onClick={() => setShowPrivacyModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <h3 style={{ margin: '0 0 8px 0' }}>Community Privacy Settings</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
              Control who can interact with you in the NuraCare community.
            </p>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 8 }}>
                Who can send you direct messages?
              </label>
              {['Everyone', 'People I follow', 'Group members', 'Nobody'].map(opt => (
                <label
                  key={opt}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    background: whoCanMessage === opt ? 'var(--green-light)' : 'transparent',
                    marginBottom: 4,
                  }}
                >
                  <input
                    type="radio"
                    name="msgPrivacy"
                    checked={whoCanMessage === opt}
                    onChange={() => setWhoCanMessage(opt)}
                  />
                  <span style={{ fontSize: 13, fontWeight: whoCanMessage === opt ? 700 : 500 }}>
                    {opt}
                  </span>
                </label>
              ))}
            </div>

            <div
              style={{
                background: '#fffbeb',
                border: '1px solid #fef3c7',
                borderRadius: 10,
                padding: 12,
                fontSize: 12,
                color: '#92400e',
                lineHeight: 1.5,
                marginBottom: 18,
              }}
            >
              🔒 <strong>Absolute Protection:</strong> Your medication schedules, symptoms, and checkup answers will NEVER appear in community feeds.
            </div>

            <button className="btn-primary" style={{ width: '100%' }} onClick={() => setShowPrivacyModal(false)}>
              Save Preferences
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
