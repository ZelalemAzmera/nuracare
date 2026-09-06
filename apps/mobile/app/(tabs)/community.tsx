import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Users,
  MessageSquare,
  Rss,
  Heart,
  MessageCircle,
  Share2,
  Plus,
  Search,
  CheckCircle2,
  ShieldCheck,
  Lock,
  Globe,
  Bell,
  Sparkles,
  Bot,
  Send,
  XCircle,
  ChevronRight,
  UserCheck,
  UserPlus,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react-native';

export type CommunitySection = 'feed' | 'groups' | 'messages';

interface CommunityPost {
  id: string;
  type: 'post' | 'challenge' | 'story' | 'announcement';
  author: string;
  authorBadge?: string;
  avatarColor: string;
  timeAgo: string;
  title?: string;
  content: string;
  likes: number;
  comments: number;
  userLiked?: boolean;
  challengeData?: {
    participants: number;
    progressPercent: number;
    joined: boolean;
  };
  storyLinkText?: string;
}

interface CommunityGroup {
  id: string;
  name: string;
  category: string;
  icon: string;
  membersCount: string;
  description: string;
  privacy: 'Public' | 'Private' | 'Hidden';
  joined: boolean;
}

interface MessageThread {
  id: string;
  senderName: string;
  isGroup: boolean;
  avatarText: string;
  avatarBg: string;
  lastMessage: string;
  timeAgo: string;
  unreadCount: number;
  messages: Array<{
    id: string;
    sender: 'them' | 'me';
    text: string;
    time: string;
  }>;
}

const INITIAL_POSTS: CommunityPost[] = [
  {
    id: 'post-1',
    type: 'post',
    author: 'Sarah M.',
    avatarColor: '#ec4899',
    timeAgo: '2h ago',
    content: '🔥 Finished my 7-day hydration challenge!\n\nMaintained 92% hydration consistency this week. Energy levels have visibly normalized during morning routines.',
    likes: 24,
    comments: 7,
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
    storyLinkText: 'Read Full Cultural Guide',
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
  },
];

const INITIAL_GROUPS: CommunityGroup[] = [
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

const INITIAL_THREADS: MessageThread[] = [
  {
    id: 'thread-1',
    senderName: 'Hana T.',
    isGroup: false,
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
    isGroup: false,
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
    isGroup: true,
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

export default function CommunityScreen() {
  const router = useRouter();

  // TOP SEGMENTED NAVIGATION: exactly 3 sections: Feed | Groups | Messages
  const [activeSection, setActiveSection] = useState<CommunitySection>('feed');

  // Feed State
  const [posts, setPosts] = useState<CommunityPost[]>(INITIAL_POSTS);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostText, setNewPostText] = useState('');

  // Groups State
  const [groups, setGroups] = useState<CommunityGroup[]>(INITIAL_GROUPS);
  const [selectedGroup, setSelectedGroup] = useState<CommunityGroup | null>(null);

  // Messages State
  const [threads, setThreads] = useState<MessageThread[]>(INITIAL_THREADS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChatThread, setActiveChatThread] = useState<MessageThread | null>(null);
  const [chatInputText, setChatInputText] = useState('');

  // Privacy Modal State
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [whoCanMessage, setWhoCanMessage] = useState<'Everyone' | 'People I follow' | 'Group members' | 'Nobody'>('Group members');

  // Handle Like
  const handleToggleLike = (postId: string) => {
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

  // Handle Challenge Join
  const handleToggleJoinChallenge = (postId: string) => {
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

  // Create Post
  const handlePublishPost = () => {
    if (!newPostText.trim()) {
      Alert.alert('Empty Post', 'Please write something before posting.');
      return;
    }
    const newPost: CommunityPost = {
      id: 'post_' + Date.now(),
      type: 'post',
      author: 'You',
      avatarColor: '#16a34a',
      timeAgo: 'Just now',
      content: newPostText.trim(),
      likes: 0,
      comments: 0,
    };
    setPosts([newPost, ...posts]);
    setNewPostText('');
    setShowCreatePost(false);
  };

  // Toggle Group Membership
  const handleToggleGroup = (groupId: string) => {
    setGroups(prev =>
      prev.map(g => {
        if (g.id === groupId) {
          const isNowJoined = !g.joined;
          return { ...g, joined: isNowJoined };
        }
        return g;
      })
    );
  };

  // Send Message in Active Chat
  const handleSendMessage = () => {
    if (!chatInputText.trim() || !activeChatThread) return;
    const newMsg = {
      id: 'm_' + Date.now(),
      sender: 'me' as const,
      text: chatInputText.trim(),
      time: 'Just now',
    };

    const updatedThreads = threads.map(t => {
      if (t.id === activeChatThread.id) {
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
    setActiveChatThread(prev =>
      prev ? { ...prev, messages: [...prev.messages, newMsg], lastMessage: newMsg.text } : null
    );
    setChatInputText('');
  };

  const filteredThreads = threads.filter(t =>
    t.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Community</Text>
          <Text style={styles.subtitle}>Connect, encourage & share wellness journeys</Text>
        </View>
        <TouchableOpacity
          style={styles.privacyLockBtn}
          onPress={() => setShowPrivacySettings(true)}
          accessibilityLabel="Community Privacy Settings"
        >
          <Lock size={16} color="#16a34a" />
          <Text style={styles.privacyLockText}>Privacy</Text>
        </TouchableOpacity>
      </View>

      {/* TOP SEGMENTED NAVIGATION: Feed | Groups | Messages */}
      <View style={styles.topSegmentedBar}>
        <TouchableOpacity
          style={[styles.topSegmentTab, activeSection === 'feed' && styles.topSegmentTabActive]}
          onPress={() => setActiveSection('feed')}
        >
          <Rss size={16} color={activeSection === 'feed' ? '#16a34a' : '#64748b'} />
          <Text style={[styles.topSegmentText, activeSection === 'feed' && styles.topSegmentTextActive]}>
            Feed
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.topSegmentTab, activeSection === 'groups' && styles.topSegmentTabActive]}
          onPress={() => setActiveSection('groups')}
        >
          <Users size={16} color={activeSection === 'groups' ? '#16a34a' : '#64748b'} />
          <Text style={[styles.topSegmentText, activeSection === 'groups' && styles.topSegmentTextActive]}>
            Groups
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.topSegmentTab, activeSection === 'messages' && styles.topSegmentTabActive]}
          onPress={() => setActiveSection('messages')}
        >
          <MessageSquare size={16} color={activeSection === 'messages' ? '#16a34a' : '#64748b'} />
          <Text style={[styles.topSegmentText, activeSection === 'messages' && styles.topSegmentTextActive]}>
            Messages
          </Text>
          {threads.reduce((acc, t) => acc + t.unreadCount, 0) > 0 && (
            <View style={styles.unreadBadgePill}>
              <Text style={styles.unreadBadgePillText}>
                {threads.reduce((acc, t) => acc + t.unreadCount, 0)}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* AI Contextual Assistant Trigger for Community */}
      <View style={styles.aiHelperStrip}>
        <Bot size={18} color="#16a34a" />
        <Text style={styles.aiHelperText}>
          {activeSection === 'feed'
            ? "Ask Nura AI: 'Show me challenges related to hydration'"
            : activeSection === 'groups'
            ? "Ask Nura AI: 'Find me a running or healthy cooking group'"
            : "Ask Nura AI: 'Tips for respectful community engagement'"}
        </Text>
        <TouchableOpacity onPress={() => router.push('/chat')}>
          <ChevronRight size={18} color="#16a34a" />
        </TouchableOpacity>
      </View>

      {/* SECTION 1: FEED */}
      {activeSection === 'feed' && (
        <ScrollView style={styles.sectionScroll} contentContainerStyle={{ paddingBottom: 60 }}>
          {/* Post Composer Bar */}
          <TouchableOpacity
            style={styles.composerBar}
            onPress={() => setShowCreatePost(true)}
          >
            <View style={styles.composerAvatar}>
              <Text style={{ color: '#ffffff', fontWeight: '700' }}>You</Text>
            </View>
            <Text style={styles.composerPlaceholder}>Share a wellness win or habit milestone...</Text>
            <Plus size={20} color="#16a34a" />
          </TouchableOpacity>

          {/* Privacy Protection Notice */}
          <View style={styles.privacyNoticeBanner}>
            <ShieldCheck size={16} color="#16a34a" />
            <Text style={styles.privacyNoticeText}>
              Protected: Medications, checkup answers, and clinical vitals are permanently excluded from Community.
            </Text>
          </View>

          {/* Feed List */}
          {posts.map(post => (
            <View key={post.id} style={styles.postCard}>
              {/* Author Row */}
              <View style={styles.postAuthorRow}>
                <View style={[styles.avatarCircle, { backgroundColor: post.avatarColor }]}>
                  <Text style={styles.avatarText}>{post.author.substring(0, 2).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.authorName}>{post.author}</Text>
                    {post.authorBadge && (
                      <View style={styles.authorBadgePill}>
                        <Text style={styles.authorBadgeText}>{post.authorBadge}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.timeAgoText}>{post.timeAgo}</Text>
                </View>
              </View>

              {/* Title if challenge/story */}
              {post.title && <Text style={styles.postTitle}>{post.title}</Text>}

              {/* Body */}
              <Text style={styles.postContent}>{post.content}</Text>

              {/* Challenge Component */}
              {post.challengeData && (
                <View style={styles.challengeBox}>
                  <View style={styles.challengeMetaRow}>
                    <Text style={styles.participantsText}>
                      👥 {post.challengeData.participants} participants
                    </Text>
                    <Text style={styles.percentText}>
                      {post.challengeData.progressPercent}% Target
                    </Text>
                  </View>
                  {/* Progress Bar */}
                  <View style={styles.progressBarTrack}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${post.challengeData.progressPercent}%` },
                      ]}
                    />
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.challengeActionBtn,
                      post.challengeData.joined && styles.challengeActionBtnJoined,
                    ]}
                    onPress={() => handleToggleJoinChallenge(post.id)}
                  >
                    <Text
                      style={[
                        styles.challengeActionBtnText,
                        post.challengeData.joined && styles.challengeActionBtnTextJoined,
                      ]}
                    >
                      {post.challengeData.joined ? 'Joined ✓' : 'Join Challenge'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Story Link */}
              {post.storyLinkText && (
                <TouchableOpacity
                  style={styles.storyLinkBtn}
                  onPress={() => Alert.alert('Wellness Story', post.content)}
                >
                  <Text style={styles.storyLinkBtnText}>[ {post.storyLinkText} ]</Text>
                </TouchableOpacity>
              )}

              {/* Actions Footer */}
              <View style={styles.postFooter}>
                <TouchableOpacity
                  style={styles.postFooterBtn}
                  onPress={() => handleToggleLike(post.id)}
                >
                  <Heart
                    size={18}
                    color={post.userLiked ? '#ef4444' : '#64748b'}
                    fill={post.userLiked ? '#ef4444' : 'transparent'}
                  />
                  <Text style={[styles.footerBtnText, post.userLiked && { color: '#ef4444', fontWeight: '700' }]}>
                    {post.likes}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.postFooterBtn}
                  onPress={() => Alert.alert('Comments', `${post.comments} comments on this post.`)}
                >
                  <MessageCircle size={18} color="#64748b" />
                  <Text style={styles.footerBtnText}>{post.comments}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.postFooterBtn}
                  onPress={() => Alert.alert('Share', 'Share this milestone with your group.')}
                >
                  <Share2 size={18} color="#64748b" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* SECTION 2: GROUPS */}
      {activeSection === 'groups' && (
        <ScrollView style={styles.sectionScroll} contentContainerStyle={{ paddingBottom: 60 }}>
          <View style={styles.groupsHeader}>
            <Text style={styles.groupsHeaderTitle}>Discover Wellness Communities</Text>
            <Text style={styles.groupsHeaderSub}>
              Connect around sports, nutrition, local running, and healthy habits.
            </Text>
          </View>

          {groups.map(group => (
            <View key={group.id} style={styles.groupCard}>
              <View style={styles.groupTopRow}>
                <Text style={styles.groupIconEmoji}>{group.icon}</Text>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.groupName}>{group.name}</Text>
                  <Text style={styles.groupMeta}>
                    {group.membersCount} members • {group.privacy}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.groupJoinBtn, group.joined && styles.groupJoinedBtn]}
                  onPress={() => handleToggleGroup(group.id)}
                >
                  <Text style={[styles.groupJoinBtnText, group.joined && styles.groupJoinedBtnText]}>
                    {group.joined ? 'Joined' : 'Join Group'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.groupDesc}>{group.description}</Text>

              <View style={styles.groupFooter}>
                <View style={styles.privacyBadge}>
                  {group.privacy === 'Public' ? (
                    <Globe size={13} color="#16a34a" />
                  ) : (
                    <Lock size={13} color="#64748b" />
                  )}
                  <Text style={styles.privacyBadgeText}>{group.privacy} Group</Text>
                </View>
                <TouchableOpacity
                  style={styles.groupDetailsBtn}
                  onPress={() => setSelectedGroup(group)}
                >
                  <Text style={styles.groupDetailsBtnText}>View Group Feed →</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* SECTION 3: MESSAGES */}
      {activeSection === 'messages' && (
        <View style={{ flex: 1 }}>
          {/* Search Bar */}
          <View style={styles.searchBarContainer}>
            <Search size={18} color="#94a3b8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search messages & contacts..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <ScrollView style={styles.sectionScroll} contentContainerStyle={{ paddingBottom: 60 }}>
            {filteredThreads.map(thread => (
              <TouchableOpacity
                key={thread.id}
                style={styles.threadCard}
                onPress={() => setActiveChatThread(thread)}
              >
                <View style={[styles.threadAvatar, { backgroundColor: thread.avatarBg }]}>
                  <Text style={styles.threadAvatarText}>{thread.avatarText}</Text>
                </View>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={styles.threadHeaderRow}>
                    <Text style={styles.threadSenderName}>{thread.senderName}</Text>
                    <Text style={styles.threadTimeAgo}>{thread.timeAgo}</Text>
                  </View>
                  <Text
                    style={[
                      styles.threadLastMessage,
                      thread.unreadCount > 0 && styles.threadLastMessageUnread,
                    ]}
                    numberOfLines={1}
                  >
                    {thread.lastMessage}
                  </Text>
                </View>

                {thread.unreadCount > 0 && (
                  <View style={styles.threadUnreadCircle}>
                    <Text style={styles.threadUnreadCircleText}>{thread.unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}

            <View style={styles.messagesPrivacyFooter}>
              <Lock size={14} color="#64748b" />
              <Text style={styles.messagesPrivacyFooterText}>
                Encrypted private channel. NuraCare AI only accesses conversations when explicitly requested.
              </Text>
            </View>
          </ScrollView>
        </View>
      )}

      {/* MODAL: Active Chat Conversation */}
      {activeChatThread && (
        <Modal visible={!!activeChatThread} animationType="slide">
          <View style={styles.chatModalContainer}>
            {/* Header */}
            <View style={styles.chatModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={[styles.threadAvatarSmall, { backgroundColor: activeChatThread.avatarBg }]}>
                  <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 13 }}>
                    {activeChatThread.avatarText}
                  </Text>
                </View>
                <View>
                  <Text style={styles.chatModalTitle}>{activeChatThread.senderName}</Text>
                  <Text style={styles.chatModalSub}>Active now • Private wellness chat</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setActiveChatThread(null)}>
                <XCircle size={26} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* Conversation Messages */}
            <ScrollView style={styles.chatMessagesScroll} contentContainerStyle={{ padding: 16 }}>
              {activeChatThread.messages.map(msg => (
                <View
                  key={msg.id}
                  style={[
                    styles.chatBubble,
                    msg.sender === 'me' ? styles.chatBubbleMe : styles.chatBubbleThem,
                  ]}
                >
                  <Text
                    style={[
                      styles.chatBubbleText,
                      msg.sender === 'me' ? styles.chatBubbleTextMe : styles.chatBubbleTextThem,
                    ]}
                  >
                    {msg.text}
                  </Text>
                  <Text
                    style={[
                      styles.chatBubbleTime,
                      msg.sender === 'me' ? styles.chatBubbleTimeMe : styles.chatBubbleTimeThem,
                    ]}
                  >
                    {msg.time}
                  </Text>
                </View>
              ))}
            </ScrollView>

            {/* Input Bar */}
            <View style={styles.chatInputBar}>
              <TextInput
                style={styles.chatInput}
                placeholder="Write a supportive message..."
                value={chatInputText}
                onChangeText={setChatInputText}
              />
              <TouchableOpacity style={styles.chatSendBtn} onPress={handleSendMessage}>
                <Send size={18} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* MODAL: Create Post */}
      <Modal visible={showCreatePost} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.createPostModalCard}>
            <View style={styles.modalTopRow}>
              <Text style={styles.modalTitle}>Share with Community</Text>
              <TouchableOpacity onPress={() => setShowCreatePost(false)}>
                <XCircle size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.createPostInput}
              placeholder="What wellness milestone or habit are you celebrating today?"
              multiline
              numberOfLines={4}
              value={newPostText}
              onChangeText={setNewPostText}
            />

            <View style={styles.modalSafetyNote}>
              <ShieldCheck size={14} color="#16a34a" />
              <Text style={styles.modalSafetyNoteText}>
                Posts are public to community members. Never post private medication or medical diagnoses.
              </Text>
            </View>

            <TouchableOpacity style={styles.publishBtn} onPress={handlePublishPost}>
              <Text style={styles.publishBtnText}>Publish Post</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL: Privacy Settings */}
      <Modal visible={showPrivacySettings} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.privacyModalCard}>
            <View style={styles.modalTopRow}>
              <Text style={styles.modalTitle}>Community Privacy & Safety</Text>
              <TouchableOpacity onPress={() => setShowPrivacySettings(false)}>
                <XCircle size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <Text style={styles.privacySubHeading}>Who can send you direct messages?</Text>
            {(['Everyone', 'People I follow', 'Group members', 'Nobody'] as const).map(opt => (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.privacyChoiceRow,
                  whoCanMessage === opt && styles.privacyChoiceRowSelected,
                ]}
                onPress={() => setWhoCanMessage(opt)}
              >
                <Text
                  style={[
                    styles.privacyChoiceText,
                    whoCanMessage === opt && styles.privacyChoiceTextSelected,
                  ]}
                >
                  {opt}
                </Text>
                {whoCanMessage === opt && <CheckCircle2 size={18} color="#16a34a" />}
              </TouchableOpacity>
            ))}

            <View style={styles.privacyShieldBox}>
              <ShieldAlert size={20} color="#b45309" />
              <Text style={styles.privacyShieldText}>
                Permanent Policy: Medication schedules, dosages, symptoms, and checkup entries are completely excluded from Community feeds and group views.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.publishBtn}
              onPress={() => setShowPrivacySettings(false)}
            >
              <Text style={styles.publishBtnText}>Save Preferences</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL: Group Detail View */}
      {selectedGroup && (
        <Modal visible={!!selectedGroup} animationType="slide">
          <View style={styles.chatModalContainer}>
            <View style={styles.chatModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={{ fontSize: 24 }}>{selectedGroup.icon}</Text>
                <View>
                  <Text style={styles.chatModalTitle}>{selectedGroup.name}</Text>
                  <Text style={styles.chatModalSub}>
                    {selectedGroup.membersCount} members • {selectedGroup.category}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setSelectedGroup(null)}>
                <XCircle size={26} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1, padding: 16 }}>
              <Text style={{ fontSize: 14, color: '#334155', lineHeight: 20, marginBottom: 16 }}>
                {selectedGroup.description}
              </Text>

              <TouchableOpacity
                style={[
                  styles.groupJoinBtn,
                  selectedGroup.joined && styles.groupJoinedBtn,
                  { alignSelf: 'flex-start', paddingHorizontal: 20, paddingVertical: 10, marginBottom: 20 },
                ]}
                onPress={() => handleToggleGroup(selectedGroup.id)}
              >
                <Text
                  style={[
                    styles.groupJoinBtnText,
                    selectedGroup.joined && styles.groupJoinedBtnText,
                  ]}
                >
                  {selectedGroup.joined ? 'Joined Community ✓' : 'Join This Group'}
                </Text>
              </TouchableOpacity>

              <Text style={{ fontSize: 16, fontWeight: '800', color: '#0f172a', marginBottom: 12 }}>
                Recent Group Activity
              </Text>

              <View style={styles.postCard}>
                <Text style={{ fontWeight: '700', color: '#0f172a', marginBottom: 4 }}>
                  Group Moderator Announcement
                </Text>
                <Text style={{ fontSize: 13, color: '#475569', lineHeight: 18 }}>
                  Welcome new members! Please check in with your goals and support each other.
                </Text>
              </View>
            </ScrollView>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 48,
    paddingBottom: 14,
    backgroundColor: '#ffffff',
  },
  title: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 2 },
  privacyLockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 4,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  privacyLockText: { fontSize: 12, fontWeight: '700', color: '#16a34a' },
  topSegmentedBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingHorizontal: 16,
  },
  topSegmentTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    gap: 6,
  },
  topSegmentTabActive: {
    borderBottomColor: '#16a34a',
  },
  topSegmentText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
  topSegmentTextActive: { color: '#16a34a', fontWeight: '800' },
  unreadBadgePill: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  unreadBadgePillText: { color: '#ffffff', fontSize: 10, fontWeight: '800' },
  aiHelperStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#dcfce7',
    gap: 8,
  },
  aiHelperText: { flex: 1, fontSize: 12, color: '#166534', fontWeight: '500' },
  sectionScroll: { flex: 1, paddingHorizontal: 16, paddingTop: 14 },
  composerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
    gap: 10,
  },
  composerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  composerPlaceholder: { flex: 1, fontSize: 13, color: '#94a3b8' },
  privacyNoticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  privacyNoticeText: { flex: 1, fontSize: 11, color: '#166534', lineHeight: 15 },
  postCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  postAuthorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#ffffff', fontWeight: '800', fontSize: 14 },
  authorName: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  authorBadgePill: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  authorBadgeText: { fontSize: 10, fontWeight: '700', color: '#0284c7' },
  timeAgoText: { fontSize: 11, color: '#94a3b8', marginTop: 1 },
  postTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginBottom: 6 },
  postContent: { fontSize: 13, color: '#334155', lineHeight: 19, marginBottom: 12 },
  challengeBox: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  challengeMetaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  participantsText: { fontSize: 12, fontWeight: '700', color: '#475569' },
  percentText: { fontSize: 12, fontWeight: '700', color: '#16a34a' },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: { height: '100%', backgroundColor: '#16a34a' },
  challengeActionBtn: {
    backgroundColor: '#16a34a',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  challengeActionBtnJoined: {
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#16a34a',
  },
  challengeActionBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 13 },
  challengeActionBtnTextJoined: { color: '#16a34a' },
  storyLinkBtn: { marginBottom: 12 },
  storyLinkBtnText: { fontSize: 13, fontWeight: '700', color: '#16a34a' },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
  },
  postFooterBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  footerBtnText: { fontSize: 12, color: '#64748b' },
  groupsHeader: { marginBottom: 14 },
  groupsHeaderTitle: { fontSize: 17, fontWeight: '800', color: '#0f172a' },
  groupsHeaderSub: { fontSize: 12, color: '#64748b', marginTop: 2 },
  groupCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  groupTopRow: { flexDirection: 'row', alignItems: 'center' },
  groupIconEmoji: { fontSize: 28 },
  groupName: { fontSize: 15, fontWeight: '800', color: '#0f172a' },
  groupMeta: { fontSize: 11, color: '#64748b', marginTop: 2 },
  groupJoinBtn: {
    backgroundColor: '#16a34a',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  groupJoinedBtn: { backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#cbd5e1' },
  groupJoinBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 12 },
  groupJoinedBtnText: { color: '#64748b' },
  groupDesc: { fontSize: 12, color: '#475569', lineHeight: 17, marginVertical: 10 },
  groupFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 8,
  },
  privacyBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  privacyBadgeText: { fontSize: 11, color: '#64748b', fontWeight: '600' },
  groupDetailsBtn: {},
  groupDetailsBtnText: { fontSize: 12, fontWeight: '700', color: '#16a34a' },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 13, color: '#0f172a' },
  threadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  threadAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  threadAvatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  threadAvatarText: { color: '#ffffff', fontWeight: '800', fontSize: 14 },
  threadHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  threadSenderName: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  threadTimeAgo: { fontSize: 11, color: '#94a3b8' },
  threadLastMessage: { fontSize: 12, color: '#64748b', marginTop: 3 },
  threadLastMessageUnread: { color: '#0f172a', fontWeight: '700' },
  threadUnreadCircle: {
    backgroundColor: '#16a34a',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  threadUnreadCircleText: { color: '#ffffff', fontSize: 10, fontWeight: '800' },
  messagesPrivacyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 6,
  },
  messagesPrivacyFooterText: { fontSize: 11, color: '#64748b', textAlign: 'center', flex: 1 },
  chatModalContainer: { flex: 1, backgroundColor: '#f8fafc' },
  chatModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : 48,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  chatModalTitle: { fontSize: 15, fontWeight: '800', color: '#0f172a' },
  chatModalSub: { fontSize: 11, color: '#64748b' },
  chatMessagesScroll: { flex: 1 },
  chatBubble: { maxWidth: '78%', padding: 12, borderRadius: 14, marginBottom: 8 },
  chatBubbleMe: { alignSelf: 'flex-end', backgroundColor: '#16a34a', borderBottomRightRadius: 2 },
  chatBubbleThem: { alignSelf: 'flex-start', backgroundColor: '#ffffff', borderBottomLeftRadius: 2, borderWidth: 1, borderColor: '#e2e8f0' },
  chatBubbleText: { fontSize: 13, lineHeight: 18 },
  chatBubbleTextMe: { color: '#ffffff' },
  chatBubbleTextThem: { color: '#0f172a' },
  chatBubbleTime: { fontSize: 9, marginTop: 4 },
  chatBubbleTimeMe: { color: '#dcfce7', alignSelf: 'flex-end' },
  chatBubbleTimeThem: { color: '#94a3b8', alignSelf: 'flex-end' },
  chatInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 8,
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0f172a',
  },
  chatSendBtn: {
    backgroundColor: '#16a34a',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  createPostModalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: { fontSize: 17, fontWeight: '800', color: '#0f172a' },
  createPostInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#0f172a',
    height: 110,
    textAlignVertical: 'top',
  },
  modalSafetyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 10,
    borderRadius: 8,
    marginVertical: 12,
    gap: 6,
  },
  modalSafetyNoteText: { flex: 1, fontSize: 11, color: '#166534' },
  publishBtn: {
    backgroundColor: '#16a34a',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  publishBtnText: { color: '#ffffff', fontSize: 14, fontWeight: '800' },
  privacyModalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  privacySubHeading: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 10 },
  privacyChoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 8,
  },
  privacyChoiceRowSelected: {
    backgroundColor: '#f0fdf4',
    borderColor: '#16a34a',
  },
  privacyChoiceText: { fontSize: 13, color: '#334155', fontWeight: '500' },
  privacyChoiceTextSelected: { color: '#16a34a', fontWeight: '700' },
  privacyShieldBox: {
    flexDirection: 'row',
    backgroundColor: '#fffbeb',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fef3c7',
    marginVertical: 14,
    gap: 8,
  },
  privacyShieldText: { flex: 1, fontSize: 11, color: '#92400e', lineHeight: 16 },
});
