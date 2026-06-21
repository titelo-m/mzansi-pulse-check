// src/routes/youth-hub.tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { 
  ArrowLeft, 
  Sparkles, 
  Users, 
  Shield, 
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
  MapPin,
  Clock,
  ExternalLink,
  Flame,
  Eye,
  Send,
  X,
  GraduationCap,
  Code,
  Music,
  Dumbbell,
  Crown,
  Compass,
  Heart,
  Target,
  Rocket,
  Lightbulb,
  BookOpen,
  School,
  TrendingUp,
  Zap,
  MessageCircle,
  ThumbsUp,
  Share2,
  Edit3,
  Image,
  User,
  Award,
  Star
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/youth-hub")({
  head: () => ({
    meta: [
      { title: "Youth Hub — MzansiPulse" },
      {
        name: "description",
        content:
          "Your future matters. Learn about substance abuse prevention, find opportunities, and connect with positive activities.",
      },
    ],
  }),
  component: YouthHub,
});

// Scenarios Data (keep these as they are, they'll use translation keys)
const SCENARIOS = [
  {
    id: 1,
    title: "youthHub.scenario.vape",
    icon: AlertTriangle,
    description: "youthHub.scenario.vapeDesc",
    choices: [
      { 
        text: "youthHub.scenario.choice.take", 
        consequence: "youthHub.scenario.choice.takeConsequence",
        good: false
      },
      { 
        text: "youthHub.scenario.choice.sayNo", 
        consequence: "youthHub.scenario.choice.sayNoConsequence",
        good: true
      },
      { 
        text: "youthHub.scenario.choice.ask", 
        consequence: "youthHub.scenario.choice.askConsequence",
        good: true
      }
    ]
  },
  {
    id: 2,
    title: "youthHub.scenario.party",
    icon: Flame,
    description: "youthHub.scenario.partyDesc",
    choices: [
      { 
        text: "youthHub.scenario.choice.drink", 
        consequence: "youthHub.scenario.choice.drinkConsequence",
        good: false
      },
      { 
        text: "youthHub.scenario.choice.notDrinking", 
        consequence: "youthHub.scenario.choice.notDrinkingConsequence",
        good: true
      },
      { 
        text: "youthHub.scenario.choice.leave", 
        consequence: "youthHub.scenario.choice.leaveConsequence",
        good: true
      }
    ]
  },
  {
    id: 3,
    title: "youthHub.scenario.drug",
    icon: Shield,
    description: "youthHub.scenario.drugDesc",
    choices: [
      { 
        text: "youthHub.scenario.choice.money", 
        consequence: "youthHub.scenario.choice.moneyConsequence",
        good: false
      },
      { 
        text: "youthHub.scenario.choice.report", 
        consequence: "youthHub.scenario.choice.reportConsequence",
        good: true
      },
      { 
        text: "youthHub.scenario.choice.walkAway", 
        consequence: "youthHub.scenario.choice.walkAwayConsequence",
        good: false
      }
    ]
  },
  {
    id: 4,
    title: "youthHub.scenario.peer",
    icon: Users,
    description: "youthHub.scenario.peerDesc",
    choices: [
      { 
        text: "youthHub.scenario.choice.skip", 
        consequence: "youthHub.scenario.choice.skipConsequence",
        good: false
      },
      { 
        text: "youthHub.scenario.choice.afterSchool", 
        consequence: "youthHub.scenario.choice.afterSchoolConsequence",
        good: true
      },
      { 
        text: "youthHub.scenario.choice.newFriends", 
        consequence: "youthHub.scenario.choice.newFriendsConsequence",
        good: true
      }
    ]
  }
];

// Facts Data
const FACTS = [
  { 
    myth: "youthHub.scenario.facts.myth1",
    fact: "youthHub.scenario.facts.fact1",
  },
  { 
    myth: "youthHub.scenario.facts.myth2",
    fact: "youthHub.scenario.facts.fact2",
  },
  { 
    myth: "youthHub.scenario.facts.myth3",
    fact: "youthHub.scenario.facts.fact3",
  },
  { 
    myth: "youthHub.scenario.facts.myth4",
    fact: "youthHub.scenario.facts.fact4",
  }
];

// Opportunities Data
const OPPORTUNITIES = [
  {
    id: 1,
    title: "SASOL Bursary Programme",
    description: "Full bursaries for STEM students. Includes tuition, books, and accommodation.",
    category: "Bursary",
    deadline: "31 August 2025",
    icon: GraduationCap,
    color: "bg-blue-500/15 text-blue-500"
  },
  {
    id: 2,
    title: "Youth Hackathon 2025",
    description: "Build tech solutions for social challenges. Win R20,000 and mentorship.",
    category: "Hackathon",
    deadline: "15 September 2025",
    icon: Code,
    color: "bg-purple-500/15 text-purple-500"
  },
  {
    id: 3,
    title: "Soccer Trials - Gauteng",
    description: "Open trials for U17 and U19 players. Scouts from professional clubs will attend.",
    category: "Sports",
    deadline: "30 August 2025",
    icon: Dumbbell,
    color: "bg-green-500/15 text-green-500"
  },
  {
    id: 4,
    title: "Youth Leadership Programme",
    description: "Develop leadership skills through community projects and workshops.",
    category: "Leadership",
    deadline: "10 October 2025",
    icon: Crown,
    color: "bg-yellow-500/15 text-yellow-500"
  },
  {
    id: 5,
    title: "Music Production Workshop",
    description: "Free workshop for youth interested in music production and sound engineering.",
    category: "Creative",
    deadline: "25 September 2025",
    icon: Music,
    color: "bg-pink-500/15 text-pink-500"
  },
  {
    id: 6,
    title: "University Open Days",
    description: "Visit Tshwane University and explore your future career options.",
    category: "Education",
    deadline: "5 September 2025",
    icon: Compass,
    color: "bg-orange-500/15 text-orange-500"
  }
];

// Student Stories Data
const INITIAL_STORIES = [
  {
    id: 1,
    name: "Thabo M.",
    age: 18,
    school: "Mamelodi High",
    title: "I Said No to Drugs",
    story: "I was offered drugs at a party. It was hard to say no, but I remembered my mom's face and my dreams of becoming a doctor. Now I'm in university studying medicine.",
    likes: 24,
    date: "2 days ago",
    verified: true
  },
  {
    id: 2,
    name: "Lerato K.",
    age: 17,
    school: "Pretoria High for Girls",
    title: "Vaping Isn't Cool",
    story: "I started vaping to fit in. I quit after 3 months and told my friends why. Three of them quit too. We started a fitness club instead.",
    likes: 18,
    date: "5 days ago",
    verified: true
  },
  {
    id: 3,
    name: "Sipho D.",
    age: 19,
    school: "Hoërskool Wonderboom",
    title: "My Future is Bigger",
    story: "I refused to sell drugs even though I was offered a lot of money. Now I'm running my own small business. My future is brighter than quick cash.",
    likes: 31,
    date: "1 week ago",
    verified: true
  }
];

function YouthHub() {
  const { t } = useI18n();
  const [selectedChoice, setSelectedChoice] = useState<{ scenarioId: number; choiceIndex: number } | null>(null);
  const [showShareStory, setShowShareStory] = useState(false);
  const [stories, setStories] = useState(INITIAL_STORIES);
  const [likedStories, setLikedStories] = useState<number[]>([]);
  
  // Story form state
  const [storyName, setStoryName] = useState("");
  const [storyAge, setStoryAge] = useState("");
  const [storySchool, setStorySchool] = useState("");
  const [storyTitle, setStoryTitle] = useState("");
  const [storyContent, setStoryContent] = useState("");
  const [storySubmitted, setStorySubmitted] = useState(false);

  const handleChoiceClick = (scenarioId: number, choiceIndex: number) => {
    setSelectedChoice({ scenarioId, choiceIndex });
  };

  const handleLike = (storyId: number) => {
    if (likedStories.includes(storyId)) {
      setLikedStories(likedStories.filter(id => id !== storyId));
      setStories(stories.map(s => 
        s.id === storyId ? { ...s, likes: s.likes - 1 } : s
      ));
    } else {
      setLikedStories([...likedStories, storyId]);
      setStories(stories.map(s => 
        s.id === storyId ? { ...s, likes: s.likes + 1 } : s
      ));
    }
  };

  const handleStorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyName || !storyAge || !storyTitle || !storyContent) {
      alert(t("common.error"));
      return;
    }
    
    const newStory = {
      id: stories.length + 1,
      name: storyName,
      age: parseInt(storyAge),
      school: storySchool || "Not specified",
      title: storyTitle,
      story: storyContent,
      likes: 0,
      date: "Just now",
      verified: false
    };
    
    setStories([newStory, ...stories]);
    setStorySubmitted(true);
    setTimeout(() => {
      setShowShareStory(false);
      setStorySubmitted(false);
      setStoryName("");
      setStoryAge("");
      setStorySchool("");
      setStoryTitle("");
      setStoryContent("");
    }, 2500);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-4">
      {/* Back */}
      <div className="mb-4">
        <a href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> {t("youthHub.back")}
        </a>
      </div>

      {/* HERO */}
      <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 p-6 md:p-8">
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
        <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-accent/10 blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Youth Hub</span>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{t("youthHub.heading")}</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">{t("youthHub.subheading")}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">{t("youthHub.beStrong")}</span>
            <span className="rounded-full bg-green-500/15 px-3 py-1 text-xs font-medium text-green-500">{t("youthHub.dreamBig")}</span>
            <span className="rounded-full bg-yellow-500/15 px-3 py-1 text-xs font-medium text-yellow-500">{t("youthHub.stayFocused")}</span>
          </div>
        </div>
      </div>

      {/* OPPORTUNITIES BOARD */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">{t("youthHub.opportunities")}</h2>
          </div>
          <span className="text-xs text-muted-foreground">Updated daily</span>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{t("youthHub.opportunitiesDesc")}</p>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {OPPORTUNITIES.map((opp) => {
            const Icon = opp.icon;
            return (
              <div key={opp.id} className="rounded-xl border border-border bg-surface p-4 hover:border-primary/30 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`rounded-lg p-2 ${opp.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className={`text-xs font-medium ${opp.color}`}>{opp.category}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {opp.deadline}
                  </span>
                </div>
                <h3 className="mt-2 font-semibold text-foreground">{opp.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{opp.description}</p>
                <button className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                  {t("youthHub.learnMore")} <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* TRENDING ALERTS */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Flame className="h-5 w-5 text-red-500" />
          <h2 className="text-xl font-bold">{t("youthHub.trendingAlerts")}</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 mt-1.5 rounded-full bg-red-500 animate-pulse" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-red-500">{t("youthHub.highAlert")}</span>
                  <span className="text-[10px] text-muted-foreground">2 hours ago</span>
                </div>
                <h3 className="text-sm font-semibold text-foreground mt-0.5">{t("youthHub.alert1.title")}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("youthHub.alert1.desc")}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 mt-1.5 rounded-full bg-yellow-500" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-yellow-500">{t("youthHub.watch")}</span>
                  <span className="text-[10px] text-muted-foreground">1 day ago</span>
                </div>
                <h3 className="text-sm font-semibold text-foreground mt-0.5">{t("youthHub.alert2.title")}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("youthHub.alert2.desc")}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 mt-1.5 rounded-full bg-yellow-500" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-yellow-500">{t("youthHub.watch")}</span>
                  <span className="text-[10px] text-muted-foreground">3 days ago</span>
                </div>
                <h3 className="text-sm font-semibold text-foreground mt-0.5">{t("youthHub.alert3.title")}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("youthHub.alert3.desc")}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 mt-1.5 rounded-full bg-green-500" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-green-500">{t("youthHub.preventionTip")}</span>
                  <span className="text-[10px] text-muted-foreground">Today</span>
                </div>
                <h3 className="text-sm font-semibold text-foreground mt-0.5">{t("youthHub.alert4.title")}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("youthHub.alert4.desc")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LEARN THE FACTS */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          <h2 className="text-xl font-bold">{t("youthHub.learnFacts")}</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{t("youthHub.learnFactsDesc")}</p>
        <div className="grid gap-3 md:grid-cols-2">
          {FACTS.map((fact, idx) => (
            <div key={idx} className="rounded-xl border border-border bg-surface p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <XCircle className="h-5 w-5 text-destructive" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-semibold uppercase tracking-wider text-destructive">{t("youthHub.myth")}</div>
                  <p className="text-sm text-foreground">{t(fact.myth)}</p>
                  <div className="mt-3 flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-success">{t("youthHub.fact")}</div>
                      <p className="text-sm text-foreground">{t(fact.fact)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SCENARIOS SECTION */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Target className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">What Would You Do?</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Real situations. Real choices. See what happens.</p>
        <div className="grid gap-4 md:grid-cols-2">
          {SCENARIOS.map((scenario) => {
            const Icon = scenario.icon;
            return (
              <div key={scenario.id} className="rounded-xl border border-border bg-surface p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">{t(scenario.title)}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{t(scenario.description)}</p>
                <div className="space-y-2">
                  {scenario.choices.map((choice, idx) => {
                    const isSelected = selectedChoice?.scenarioId === scenario.id && selectedChoice?.choiceIndex === idx;
                    const showConsequence = isSelected;
                    return (
                      <div key={idx}>
                        <button
                          onClick={() => handleChoiceClick(scenario.id, idx)}
                          className={`w-full text-left rounded-lg border px-3 py-2 text-sm transition-colors ${
                            isSelected 
                              ? choice.good 
                                ? 'border-green-500/50 bg-green-500/10 text-foreground' 
                                : 'border-red-500/50 bg-red-500/10 text-foreground'
                              : 'border-border bg-background text-foreground hover:border-primary/30'
                          }`}
                        >
                          {t(choice.text)}
                        </button>
                        {showConsequence && (
                          <div className={`mt-2 rounded-lg p-2 text-xs ${
                            choice.good 
                              ? 'bg-green-500/10 text-green-500' 
                              : 'bg-red-500/10 text-red-500'
                          }`}>
                            {t(choice.consequence)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* STUDENT STORIES */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">{t("youthHub.studentStories")}</h2>
          </div>
          <button
            onClick={() => setShowShareStory(true)}
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            <Edit3 className="inline h-3.5 w-3.5 mr-1" /> {t("youthHub.shareStory")}
          </button>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{t("youthHub.studentStoriesDesc")}</p>
        
        {stories.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface p-8 text-center">
            <p className="text-muted-foreground">{t("youthHub.noStories")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {stories.map((story) => (
              <div key={story.id} className="rounded-xl border border-border bg-surface p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{story.name}</span>
                        <span className="text-xs text-muted-foreground">• {story.age} yrs</span>
                        {story.verified && (
                          <span className="text-[10px] font-medium text-green-500 flex items-center gap-0.5">
                            <CheckCircle2 className="h-3 w-3" /> {t("youthHub.verified")}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {story.school} • {story.date}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground bg-surface-elevated px-2 py-0.5 rounded-full">
                    {story.likes} {t("youthHub.likes")}
                  </span>
                </div>
                <h3 className="mt-2 font-semibold text-foreground">{story.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">"{story.story}"</p>
                <div className="mt-3 flex items-center gap-4">
                  <button 
                    onClick={() => handleLike(story.id)}
                    className={`inline-flex items-center gap-1 text-xs transition-colors ${
                      likedStories.includes(story.id) 
                        ? 'text-primary' 
                        : 'text-muted-foreground hover:text-primary'
                    }`}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    {likedStories.includes(story.id) ? t("youthHub.liked") : t("youthHub.like")} ({story.likes})
                  </button>
                  <button className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <Share2 className="h-4 w-4" /> {t("youthHub.share")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SHARE STORY MODAL */}
      {showShareStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-2xl bg-surface p-6 shadow-2xl">
            <button
              onClick={() => setShowShareStory(false)}
              className="absolute right-4 top-4 p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            {storySubmitted ? (
              <div className="py-8 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
                <h3 className="mt-3 text-xl font-bold">{t("youthHub.modal.success")}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("youthHub.modal.successDesc")}
                </p>
                <p className="mt-2 text-xs text-muted-foreground bg-green-500/10 p-2 rounded-lg">
                  {t("youthHub.modal.successNote")}
                </p>
                <button
                  onClick={() => setShowShareStory(false)}
                  className="mt-4 rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-primary/90"
                >
                  {t("youthHub.modal.done")}
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Edit3 className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold">{t("youthHub.shareStory")}</h2>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("youthHub.modal.desc")}
                </p>

                <form onSubmit={handleStorySubmit} className="mt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder={t("youthHub.modal.name")}
                      value={storyName}
                      onChange={(e) => setStoryName(e.target.value)}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      required
                    />
                    <input
                      type="number"
                      placeholder={t("youthHub.modal.age")}
                      value={storyAge}
                      onChange={(e) => setStoryAge(e.target.value)}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      required
                    />
                  </div>
                  <input
                    type="text"
                    placeholder={t("youthHub.modal.school")}
                    value={storySchool}
                    onChange={(e) => setStorySchool(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <input
                    type="text"
                    placeholder={t("youthHub.modal.titlePlaceholder")}
                    value={storyTitle}
                    onChange={(e) => setStoryTitle(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                  <textarea
                    placeholder={t("youthHub.modal.story")}
                    value={storyContent}
                    onChange={(e) => setStoryContent(e.target.value)}
                    rows={4}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
                  >
                    <Send className="inline h-4 w-4 mr-2" />
                    {t("youthHub.modal.submit")}
                  </button>
                  <p className="text-center text-xs text-muted-foreground">
                    <Shield className="inline h-3 w-3 mr-1" />
                    {t("youthHub.modal.anonymous")}
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}