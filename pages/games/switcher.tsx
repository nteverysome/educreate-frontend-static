import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

const games = [
  {
    id: 'shimozurdo-game',
    name: 'Shimozurdo Game',
    description: '互動式詞彙學習遊戲',
    icon: '🎯',
    path: '/games/shimozurdo-game',
    category: '詞彙學習'
  },
  {
    id: 'airplane-game',
    name: 'Airplane Game',
    description: '飛行射擊詞彙遊戲',
    icon: '✈️',
    path: '/games/airplane-game',
    category: '動作遊戲'
  }
];

export default function GameSwitcher() {
  const [selectedGame, setSelectedGame] = useState(games[0]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <Head>
        <title>遊戲切換器 - EduCreate</title>
        <meta name="description" content="選擇您想要玩的教育遊戲" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <Link href="/" className="text-blue-500 hover:text-blue-600 mb-4 inline-block">
            ← 返回首頁
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🎮 遊戲切換器
          </h1>
          <p className="text-lg text-gray-600">
            選擇您想要體驗的教育遊戲
          </p>
        </header>

        {/* Game Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game List */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold mb-4">可用遊戲</h2>
            <div className="space-y-3">
              {games.map((game) => (
                <button
                  key={game.id}
                  onClick={() => setSelectedGame(game)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedGame.id === game.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{game.icon}</span>
                    <div>
                      <h3 className="font-semibold">{game.name}</h3>
                      <p className="text-sm text-gray-600">{game.category}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Game Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">{selectedGame.icon}</div>
                <h2 className="text-2xl font-bold mb-2">{selectedGame.name}</h2>
                <p className="text-gray-600 mb-4">{selectedGame.description}</p>
                <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {selectedGame.category}
                </span>
              </div>

              {/* Game Features */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">遊戲特色：</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span>GEPT 詞彙分級</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span>記憶科學設計</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span>響應式設計</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span>學習進度追蹤</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <a
                  href={selectedGame.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-blue-500 text-white text-center py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                >
                  🚀 開始遊戲
                </a>
                <Link
                  href={selectedGame.path}
                  className="flex-1 bg-gray-100 text-gray-700 text-center py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                >
                  📱 在當前頁面打開
                </Link>
              </div>
            </div>

            {/* Game Stats */}
            <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-semibold mb-4">🏆 遊戲統計</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-500">0</div>
                  <div className="text-sm text-gray-600">遊戲次數</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-500">0</div>
                  <div className="text-sm text-gray-600">最高分數</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-500">0</div>
                  <div className="text-sm text-gray-600">學習詞彙</div>
                </div>
              </div>
              <p className="text-xs text-gray-500 text-center mt-4">
                * 統計數據將在後端 API 連接後顯示
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
