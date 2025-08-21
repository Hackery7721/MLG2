// Entities for Level 1

export const player = {
  name: 'Player',
  speed: 5,
  health: 100,
  points: 0,
  images: {
    idle: '/MLG/tv_content/Player/Idle.png',
    runningRight: ['/MLG/tv_content/Player/Running1.png', '/MLG/tv_content/Player/Running2.png'],
    runningLeft: ['/MLG/tv_content/Player/Running1.png', '/MLG/tv_content/Player/Running2.png'], // will be flipped horizontally in code
  }
};

export const boss = {
  name: 'Activision Boss',
  speed: 2,
  health: 500,
  points: 1000,
  image: '/MLG/tv_content/Enemy/Level 1/Boss/Activision.png',
  attacks: [
    {
      name: 'Attack 1',
      image: '/MLG/tv_content/Enemy/Level 1/Boss/BossAttacks/1.png',
      speed: 3,
      health: 50,
      points: 200,
    },
    {
      name: 'Attack 2',
      image: '/MLG/tv_content/Enemy/Level 1/Boss/BossAttacks/2.png',
      speed: 3,
      health: 50,
      points: 200,
    },
    {
      name: 'Attack 3',
      image: '/MLG/tv_content/Enemy/Level 1/Boss/BossAttacks/3.png',
      speed: 3,
      health: 50,
      points: 200,
    },
    {
      name: 'Attack 4',
      image: '/MLG/tv_content/Enemy/Level 1/Boss/BossAttacks/4.png',
      speed: 3,
      health: 50,
      points: 200,
    },
    {
      name: 'Attack 5',
      image: '/MLG/tv_content/Enemy/Level 1/Boss/BossAttacks/5.png',
      speed: 3,
      health: 50,
      points: 200,
    }
  ]
};

// Global config for normal enemy spawn logic
export const normalEnemyConfig = {
  maxOnScreen: 100, // Maximum number of normal enemies on screen at once
  spawnRate: 0.5    // Enemies spawn every 0.5 seconds (example)
};

export const enemies = [
  { name: '948782', speed: .1, health: 50, points: 100, image: "/MLG/tv_content/Enemy/Level 1/Normal Enemy's/948782.png" },
  { name: 'Ali-A', speed: .1, health: 50, points: 100, image: "/MLG/tv_content/Enemy/Level 1/Normal Enemy's/Ali-A.png" },
  { name: 'doge', speed: .1, health: 50, points: 100, image: "/MLG/tv_content/Enemy/Level 1/Normal Enemy's/doge.png" },
  { name: 'dorito', speed: .1, health: 50, points: 100, image: "/MLG/tv_content/Enemy/Level 1/Normal Enemy's/dorito.png" },
  { name: 'FaZe-Clan-Logo', speed: .1, health: 50, points: 100, image: "/MLG/tv_content/Enemy/Level 1/Normal Enemy's/FaZe-Clan-Logo.png" },
  { name: 'FaZe_Banks', speed: .1, health: 50, points: 100, image: "/MLG/tv_content/Enemy/Level 1/Normal Enemy's/FaZe_Banks.png" },
  { name: 'Frog', speed: .1, health: 50, points: 100, image: "/MLG/tv_content/Enemy/Level 1/Normal Enemy's/Frog.png" },
  { name: 'illuminati4', speed: .1, health: 50, points: 100, image: "/MLG/tv_content/Enemy/Level 1/Normal Enemy's/illuminati4.png" },
  { name: 'jev', speed: .1, health: 50, points: 100, image: "/MLG/tv_content/Enemy/Level 1/Normal Enemy's/jev.png" },
  { name: 'kim', speed: .1, health: 50, points: 100, image: "/MLG/tv_content/Enemy/Level 1/Normal Enemy's/kim.png" },
  { name: 'Mtn_dew', speed: .1, health: 50, points: 100, image: "/MLG/tv_content/Enemy/Level 1/Normal Enemy's/Mtn_dew.png" },
  { name: 'noice', speed: .1, health: 50, points: 100, image: "/MLG/tv_content/Enemy/Level 1/Normal Enemy's/noice.png" },
  { name: 'Obey', speed: .1, health: 50, points: 100, image: "/MLG/tv_content/Enemy/Level 1/Normal Enemy's/Obey.png" },
  { name: 'OpTic', speed: .1, health: 50, points: 100, image: "/MLG/tv_content/Enemy/Level 1/Normal Enemy's/OpTic.png" },
  { name: 'Pepe', speed: .1, health: 50, points: 100, image: "/MLG/tv_content/Enemy/Level 1/Normal Enemy's/Pepe.png" },
  { name: 'puuss', speed: .1, health: 50, points: 100, image: "/MLG/tv_content/Enemy/Level 1/Normal Enemy's/puuss.png" },
  { name: 'rainwildin', speed: .1, health: 50, points: 100, image: "/MLG/tv_content/Enemy/Level 1/Normal Enemy's/rainwildin.png" },
  { name: 'Roblox', speed: .1, health: 50, points: 100, image: "/MLG/tv_content/Enemy/Level 1/Normal Enemy's/Roblox.png" },
  { name: 'shrek2', speed: .1, health: 50, points: 100, image: "/MLG/tv_content/Enemy/Level 1/Normal Enemy's/shrek2.png" },
  { name: 'Smile', speed: .1, health: 50, points: 100, image: "/MLG/tv_content/Enemy/Level 1/Normal Enemy's/Smile.png" },
  { name: 'snoop', speed: .1, health: 50, points: 100, image: "/MLG/tv_content/Enemy/Level 1/Normal Enemy's/snoop.png" },
  { name: 'Snoop_dogg_pose2', speed: .1, health: 50, points: 100, image: "/MLG/tv_content/Enemy/Level 1/Normal Enemy's/Snoop_dogg_pose2.png" },
  { name: 'troll face', speed: .1, health: 50, points: 100, image: "/MLG/tv_content/Enemy/Level 1/Normal Enemy's/troll face.png" },
  { name: 'troll', speed: .1, health: 50, points: 100, image: "/MLG/tv_content/Enemy/Level 1/Normal Enemy's/troll.png" }
];

// Utility: Get a random enemy for spawning
export function getRandomEnemy() {
  return enemies[Math.floor(Math.random() * enemies.length)];
}
