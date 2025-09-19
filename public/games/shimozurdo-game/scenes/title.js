export default class Title extends Phaser.Scene {

    // Vars - 場景變數定義
    handlerScene = false        // 場景管理器引用
    sceneStopped = false        // 場景停止狀態標記
    backgroundLayers = null     // 視差背景層物件容器
    scrollPositions = null      // 各背景層滾動位置記錄

    constructor() {
        super({ key: 'title' })  // 註冊場景名稱為 'title'
    }

    preload() {
        this.sceneStopped = false                        // 重置場景停止狀態
        this.width = this.game.screenBaseSize.width     // 獲取設計基準寬度
        this.height = this.game.screenBaseSize.height   // 獲取設計基準高度
        this.handlerScene = this.scene.get('handler')   // 獲取場景管理器引用
        this.handlerScene.sceneRunning = 'title'        // 通知管理器當前運行場景
    }

    create() {
        const { width, height } = this                   // 解構賦值獲取寬高
        // CONFIG SCENE - 場景配置區塊
        this.handlerScene.updateResize(this)             // 更新響應式配置
        if (this.game.debugMode)                         // 如果是調試模式
            this.add.image(0, 0, 'guide').setOrigin(0).setDepth(1)  // 顯示輔助參考線
        // CONFIG SCENE

        // 創建視差背景 - 多層滾動背景系統
        this.createParallaxBackground()

        // 🚀 創建太空船（防禦性編程）- 主角太空船系統
        this.createSpaceship()

        // ☁️ 創建敵人系統 - 雲朵敵人生成和管理
        this.createEnemySystem()

        // ❤️ 創建生命值系統 - 玩家血量顯示和管理
        this.createHealthSystem()

        // GAME OBJECTS - 遊戲物件區塊
        // 初始化響應式元素數組 - 用於螢幕尺寸變化時的元素調整
        this.testElements = [];

        // 註冊響應式元素 - 將所有需要響應式調整的元素註冊到系統
        this.registerResponsiveElements();
        // GAME OBJECTS
    }

    /**
     * 創建視差背景 - 建立多層滾動背景系統創造深度感
     */
    createParallaxBackground() {

        const { width, height } = this;                  // 獲取場景尺寸

        // 創建基礎背景色（深太空） - 確保有底色防止透明
        const bgRect = this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);  // 深藍紫色太空背景
        bgRect.setDepth(-110);                           // 設置為最底層

        // 創建背景層 - 用於存儲所有視差背景層
        this.backgroundLayers = {};

        // 背景層配置 - 定義6層背景的屬性和深度
        const layerConfigs = [
            { key: 'bg_layer_1', name: 'sky', depth: -100, alpha: 1.0 },    // 最遠星空層
            { key: 'bg_layer_2', name: 'moon', depth: -95, alpha: 1.0 },    // 月亮主體層
            { key: 'bg_layer_3', name: 'back', depth: -90, alpha: 0.9 },    // 遠景雲層
            { key: 'bg_layer_4', name: 'mid', depth: -85, alpha: 0.9 },     // 中景雲層
            { key: 'bg_layer_5', name: 'front', depth: -80, alpha: 0.9 },   // 近景雲層
            { key: 'bg_layer_6', name: 'floor', depth: -75, alpha: 0.8 }    // 最前景雲霧層
        ];

        // 創建每一層背景 - 遍歷配置數組創建所有背景層
        layerConfigs.forEach(config => {
            if (this.textures.exists(config.key)) {     // 檢查資源是否存在
                // 使用 TileSprite 創建可滾動背景 - 支援無限滾動
                const layer = this.add.tileSprite(0, 0, width, height, config.key);
                layer.setOrigin(0, 0);                   // 設置原點為左上角
                layer.setDepth(config.depth);            // 設置視覺深度層級
                layer.setAlpha(config.alpha);            // 設置透明度
                layer.setVisible(true);                  // 確保可見



                // 儲存到背景層物件 - 用名稱作為鍵值便於後續操作
                this.backgroundLayers[config.name] = layer;

                console.log(`✅ 創建背景層: ${config.key} (${config.name})`);
            } else {
                console.warn(`⚠️ 背景資源不存在: ${config.key}`);  // 資源不存在時的警告
            }
        });

        // 初始化滾動位置 - 記錄每層背景的滾動偏移量
        this.scrollPositions = {
            sky: 0,      // 星空層滾動位置
            moon: 0,     // 月亮層滾動位置
            back: 0,     // 遠景層滾動位置
            mid: 0,      // 中景層滾動位置
            front: 0,    // 近景層滾動位置
            floor: 0     // 前景層滾動位置
        };


    }

    /**
     * 🚀 創建太空船（防禦性編程）- 主角太空船創建和動畫設置
     */
    createSpaceship() {
        const { width, height } = this;                  // 獲取場景尺寸

        // 防禦性檢查：確認精靈圖是否存在 - 避免資源載入失敗導致崩潰
        if (this.textures.exists('player_spaceship')) {
            console.log('✅ 使用真實太空船精靈圖')

            try {
                // 創建7幀動畫 - 太空船飛行動畫序列
                this.anims.create({
                    key: 'spaceship_fly',                // 動畫名稱
                    frames: this.anims.generateFrameNumbers('player_spaceship', {
                        start: 0, end: 6                // 使用第0-6幀，共7幀
                    }),
                    frameRate: 10,                       // 每秒10幀的播放速度
                    repeat: -1                           // 無限循環播放
                });

                // 創建太空船精靈（先用簡單方式確保顯示）
                this.player = this.add.sprite(width * 0.15, height * 0.5, 'player_spaceship');  // 位置在左側15%，垂直中央
                this.player.setOrigin(0.5, 0.5);        // 設置中心點為精靈中央
                this.player.setScale(0.4);               // 縮放到40%大小
                this.player.setDepth(-60);               // 在視差背景前景，調整深度層級
                this.player.play('spaceship_fly');       // 播放飛行動畫

                // 初始化移動相關變數 - 用於控制太空船移動
                this.playerSpeed = 250;                  // 移動速度（像素/秒）
                this.playerTargetY = this.player.y;      // 目標Y座標（用於平滑移動）

                console.log('✅ 太空船精靈創建成功，位置:', this.player.x, this.player.y);

                console.log('✅ 太空船精靈圖動畫創建成功');

            } catch (error) {
                console.error('❌ 太空船動畫創建失敗:', error);
                this.createBackupSpaceship(width, height);  // 失敗時使用備用方案
            }

        } else {
            console.warn('⚠️ 太空船精靈圖不存在，使用備用方案');
            this.createBackupSpaceship(width, height);      // 資源不存在時使用備用方案
        }

        // 設置太空船控制 - 初始化鍵盤和滑鼠控制
        this.setupSpaceshipControls();
    }

    /**
     * 🔧 創建備用太空船（優雅降級）- 當精靈圖載入失敗時的備用方案
     */
    createBackupSpaceship(width, height) {
        console.log('🔧 創建備用太空船');

        try {
            // 創建簡單的三角形太空船 - 使用程序生成圖形
            const graphics = this.add.graphics();

            // 太空船主體（藍色三角形） - 主要船身
            graphics.fillStyle(0x4facfe);                // 設置藍色填充
            graphics.fillTriangle(30, 0, 0, 20, 0, -20); // 繪製向右的三角形

            // 太空船邊框 - 增加視覺層次
            graphics.lineStyle(2, 0xffffff, 1);          // 設置白色邊框線
            graphics.strokeTriangle(30, 0, 0, 20, 0, -20); // 繪製三角形邊框

            // 引擎火焰 - 增加動感
            graphics.fillStyle(0xff4444);                // 設置紅色填充
            graphics.fillTriangle(-5, 0, -15, 8, -15, -8); // 繪製向左的火焰三角形

            // 生成紋理 - 將繪製的圖形轉換為可重用的紋理
            graphics.generateTexture('backup_spaceship', 45, 40);  // 生成45x40像素的紋理
            graphics.destroy();                          // 銷毀臨時圖形物件釋放記憶體

            // 創建備用太空船（簡單方式確保顯示）
            this.player = this.add.sprite(width * 0.15, height * 0.5, 'backup_spaceship');  // 使用生成的紋理創建精靈
            this.player.setOrigin(0.5, 0.5);            // 設置中心點
            this.player.setScale(1.2);                   // 稍微放大以匹配原始太空船大小
            this.player.setDepth(-60);                   // 設置深度層級

            // 初始化移動相關變數 - 與原始太空船相同的移動參數
            this.playerSpeed = 250;                      // 移動速度
            this.playerTargetY = this.player.y;          // 目標Y座標

            console.log('✅ 備用太空船創建成功，位置:', this.player.x, this.player.y);

            console.log('✅ 備用太空船創建成功');

        } catch (error) {
            console.error('❌ 備用太空船創建也失敗:', error);  // 連備用方案都失敗的錯誤處理
        }
    }

    /**
     * 🎮 設置太空船控制（非物理方式）- 初始化多種輸入控制方式
     */
    setupSpaceshipControls() {
        if (!this.player) {                              // 防禦性檢查
            console.warn('⚠️ 太空船不存在，無法設置控制');
            return;
        }

        // 1. 鍵盤控制 - 設置方向鍵和WASD鍵
        this.cursors = this.input.keyboard.createCursorKeys();  // 創建方向鍵監聽器
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');     // 創建WASD鍵監聽器

        // 2. 點擊/觸控控制 - 設置目標位置實現平滑移動
        this.input.on('pointerdown', (pointer) => {     // 監聽滑鼠點擊或觸控事件
            if (!this.player) return;                   // 確保太空船存在

            const clickY = pointer.y;                    // 獲取點擊的Y座標
            const playerY = this.player.y;               // 獲取太空船當前Y座標

            if (clickY < playerY - 30) {                 // 點擊在太空船上方30像素以上
                // 點擊上方，設置向上移動目標
                this.playerTargetY = Math.max(80, playerY - 100);  // 設置目標位置，最高不超過80像素
                console.log('🔼 太空船向上移動');
            } else if (clickY > playerY + 30) {          // 點擊在太空船下方30像素以下
                // 點擊下方，設置向下移動目標
                const { height } = this;                 // 獲取場景高度
                this.playerTargetY = Math.min(height - 80, playerY + 100);  // 設置目標位置，最低不超過底部80像素
                console.log('🔽 太空船向下移動');
            }
        });

        console.log('🎮 太空船控制設置完成：方向鍵、WASD、點擊');
    }

    /**
     * ☁️ 創建敵人系統 - 初始化雲朵敵人生成和管理系統
     */
    createEnemySystem() {
        // 初始化敵人群組 - 用於存儲所有活躍的敵人
        this.enemies = [];
        this.enemySpawnTimer = 0;                        // 敵人生成計時器
        this.enemySpawnDelay = 3000;                     // 3秒生成一個敵人（毫秒）

        console.log('☁️ 敵人系統初始化完成');
    }

    /**
     * ❤️ 創建生命值系統 - 建立玩家血量顯示和管理系統
     */
    createHealthSystem() {
        const { width, height } = this;                  // 獲取場景尺寸

        // 生命值設定 - 初始化血量參數
        this.maxHealth = 100;                            // 最大生命值
        this.currentHealth = 100;                        // 當前生命值

        // 生命值條位置和尺寸（左下角） - 計算UI元素位置
        const healthBarWidth = 200;                      // 生命值條寬度
        const healthBarHeight = 20;                      // 生命值條高度
        const margin = 20;                               // 邊距
        const healthBarX = margin;                       // X座標（左邊距）
        const healthBarY = height - margin - healthBarHeight;  // Y座標（底部邊距）

        // 創建生命值條背景（黑色邊框） - 最外層邊框
        this.healthBarBg = this.add.rectangle(
            healthBarX,                                  // X座標
            healthBarY,                                  // Y座標
            healthBarWidth + 4,                          // 寬度（比內容寬4像素）
            healthBarHeight + 4,                         // 高度（比內容高4像素）
            0x000000                                     // 黑色
        );
        this.healthBarBg.setOrigin(0, 0);               // 設置原點為左上角
        this.healthBarBg.setDepth(100);                 // 確保在最前面

        // 創建生命值條背景（深灰色） - 內層背景
        this.healthBarBackground = this.add.rectangle(
            healthBarX + 2,                              // X座標（內縮2像素）
            healthBarY + 2,                              // Y座標（內縮2像素）
            healthBarWidth,                              // 實際寬度
            healthBarHeight,                             // 實際高度
            0x333333                                     // 深灰色
        );
        this.healthBarBackground.setOrigin(0, 0);        // 設置原點為左上角
        this.healthBarBackground.setDepth(101);          // 在邊框之上

        // 創建生命值條（綠色） - 實際血量顯示條
        this.healthBar = this.add.rectangle(
            healthBarX + 2,                              // X座標（與背景對齊）
            healthBarY + 2,                              // Y座標（與背景對齊）
            healthBarWidth,                              // 初始寬度（滿血狀態）
            healthBarHeight,                             // 高度
            0x00ff00                                     // 綠色
        );
        this.healthBar.setOrigin(0, 0);                  // 設置原點為左上角
        this.healthBar.setDepth(102);                    // 在背景之上

        // 創建生命值文字 - 顯示數值
        this.healthText = this.add.text(
            healthBarX + healthBarWidth + 15,            // X座標（生命值條右側15像素）
            healthBarY + healthBarHeight / 2,            // Y座標（生命值條垂直中央）
            `${this.currentHealth}/${this.maxHealth}`,   // 顯示當前/最大生命值
            {
                fontSize: '16px',                        // 字體大小
                color: '#ffffff',                        // 白色文字
                fontStyle: 'bold'                        // 粗體
            }
        );
        this.healthText.setOrigin(0, 0.5);               // 設置原點為左側中央
        this.healthText.setDepth(103);                   // 在所有元素之上

        console.log('❤️ 生命值系統初始化完成');
    }

    /**
     * ❤️ 更新生命值顯示 - 根據當前血量更新UI顯示
     */
    updateHealthDisplay() {
        if (!this.healthBar || !this.healthText) return;  // 防禦性檢查

        // 計算生命值百分比 - 用於計算顯示寬度和顏色
        const healthPercent = this.currentHealth / this.maxHealth;

        // 更新生命值條寬度 - 根據血量百分比調整寬度
        const maxWidth = 200;                            // 最大寬度
        this.healthBar.displayWidth = maxWidth * healthPercent;  // 按比例調整寬度

        // 根據生命值改變顏色 - 提供視覺警告
        let color = 0x00ff00;                            // 預設綠色（健康）
        if (healthPercent <= 0.3) {                      // 血量低於30%
            color = 0xff0000;                            // 紅色（危險）
        } else if (healthPercent <= 0.6) {               // 血量低於60%
            color = 0xffff00;                            // 黃色（警告）
        }
        this.healthBar.setFillStyle(color);              // 應用顏色變化

        // 更新文字 - 顯示具體數值
        this.healthText.setText(`${this.currentHealth}/${this.maxHealth}`);
    }

    /**
     * ❤️ 受到傷害 - 處理玩家受傷邏輯
     */
    takeDamage(damage) {
        this.currentHealth = Math.max(0, this.currentHealth - damage);  // 扣除傷害，最低為0
        this.updateHealthDisplay();                      // 更新UI顯示

        if (this.currentHealth <= 0) {                   // 檢查是否死亡
            console.log('💀 太空船被摧毀！');
            // 這裡可以添加遊戲結束邏輯
        }

        console.log(`💥 受到 ${damage} 點傷害，剩餘生命值: ${this.currentHealth}`);
    }

    /**
     * ❤️ 恢復生命值 - 處理玩家治療邏輯
     */
    heal(amount) {
        this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);  // 增加生命值，最高為最大值
        this.updateHealthDisplay();                      // 更新UI顯示

        console.log(`💚 恢復 ${amount} 點生命值，當前生命值: ${this.currentHealth}`);
    }

    /**
     * ☁️ 生成雲朵敵人 - 創建新的雲朵敵人並設置其屬性和動畫
     */
    spawnCloudEnemy() {
        // 檢查資源是否存在 - 防禦性編程
        if (!this.textures.exists('cloud_enemy')) {
            console.warn('⚠️ 雲朵敵人資源不存在');
            return;
        }

        // 🎯 使用攝影機 worldView 獲取真正的 FIT 後遊戲可見區域
        const cam = this.cameras.main;
        const worldView = cam.worldView;  // 經過 FIT 縮放後的實際遊戲區域

        // 計算生成位置 - 在 FIT 後的遊戲區域右邊界外
        const spawnX = worldView.right + Phaser.Math.Between(100, 300);  // 右邊界外 100-300 像素
        const spawnY = Phaser.Math.Between(worldView.top + 100, worldView.bottom - 100);  // Y 在遊戲區域內

        // 創建敵人（從 FIT 後遊戲區域外開始） - 確保在真正的遊戲區域外生成
        const enemy = this.add.sprite(spawnX, spawnY, 'cloud_enemy');
        enemy.setOrigin(0.5, 0.5);                       // 設置中心點
        enemy.setScale(0.4);                             // 與太空船相同大小
        enemy.setDepth(-65);                             // 在太空船後面，視差背景前面
        enemy.setAlpha(0.8);                             // 稍微透明，更像雲朵

        // 設置敵人屬性 - 移動速度
        enemy.speed = Phaser.Math.Between(1, 3);         // 隨機速度（1-3像素/幀）

        // 添加浮動動畫 - 讓雲朵上下浮動增加真實感
        this.tweens.add({
            targets: enemy,                              // 動畫目標
            y: enemy.y + Phaser.Math.Between(-30, 30),   // 上下浮動30像素範圍
            duration: Phaser.Math.Between(2000, 4000),   // 動畫持續時間2-4秒
            yoyo: true,                                  // 來回運動
            repeat: -1,                                  // 無限重複
            ease: 'Sine.easeInOut'                       // 平滑的緩動效果
        });

        // 添加到敵人群組 - 用於統一管理
        this.enemies.push(enemy);

        console.log(`☁️ 生成雲朵敵人在位置 (${enemy.x}, ${enemy.y})`);
        console.log(`📐 攝影機 worldView: left=${worldView.left}, right=${worldView.right}, top=${worldView.top}, bottom=${worldView.bottom}`);
    }

    /**
     * ☁️ 更新敵人系統 - 管理敵人生成、移動、碰撞和清理
     */
    updateEnemies() {
        const currentTime = this.time.now;               // 獲取當前時間

        // 生成新敵人 - 根據計時器定期生成
        if (currentTime - this.enemySpawnTimer > this.enemySpawnDelay) {  // 檢查是否到了生成時間
            this.spawnCloudEnemy();                      // 生成新敵人
            this.enemySpawnTimer = currentTime;          // 重置計時器

            // 隨機化下次生成時間 (2-4秒) - 增加遊戲變化性
            this.enemySpawnDelay = Phaser.Math.Between(2000, 4000);
        }

        // 更新現有敵人 - 倒序遍歷以安全刪除元素
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];              // 獲取當前敵人

            if (enemy && enemy.active) {                 // 檢查敵人是否有效且活躍
                // 向左移動 - 敵人從右向左移動
                enemy.x -= enemy.speed;

                // 檢查與太空船的碰撞 - 碰撞檢測
                if (this.player && this.checkCollision(this.player, enemy)) {
                    // 太空船受到傷害 - 處理碰撞後果
                    this.takeDamage(10);                 // 造成10點傷害

                    // 銷毀敵人 - 清理碰撞的敵人
                    enemy.destroy();                     // 銷毀精靈物件
                    this.enemies.splice(i, 1);          // 從陣列中移除
                    console.log('💥 太空船與雲朵碰撞！');
                    continue;                            // 跳過後續檢查
                }

                // 🎯 使用攝影機 worldView 判斷是否飛出 FIT 後的遊戲區域
                const cam = this.cameras.main;
                const worldView = cam.worldView;

                // 完全飛出 FIT 後遊戲區域左邊界時銷毀
                if (enemy.x < worldView.left - 100) {    // 檢查是否移出 FIT 後遊戲區域左側
                    enemy.destroy();                     // 銷毀精靈物件
                    this.enemies.splice(i, 1);          // 從陣列中移除
                    console.log('☁️ 雲朵敵人飛出 FIT 遊戲區域，已銷毀');
                }
            } else {
                // 清理無效敵人 - 移除已被銷毀或無效的敵人引用
                this.enemies.splice(i, 1);
            }
        }
    }

    /**
     * 💥 檢查兩個物件的碰撞 - 使用矩形邊界檢測碰撞
     */
    checkCollision(obj1, obj2) {
        if (!obj1 || !obj2 || !obj1.active || !obj2.active) return false;  // 防禦性檢查

        // 獲取物件的邊界 - 取得兩個物件的矩形邊界
        const bounds1 = obj1.getBounds();               // 第一個物件的邊界矩形
        const bounds2 = obj2.getBounds();               // 第二個物件的邊界矩形

        // 檢查矩形碰撞 - 使用Phaser內建的矩形重疊檢測
        return Phaser.Geom.Rectangle.Overlaps(bounds1, bounds2);
    }

    /**
     * 更新視差背景 - 讓不同背景層以不同速度滾動創造深度感
     */
    updateParallaxBackground() {
        if (!this.backgroundLayers) return;             // 防禦性檢查

        // 不同層以不同速度移動創造視差效果 - 遠的慢，近的快
        const speeds = {
            sky: 0.05,    // 最遠星空層移動最慢
            moon: 0.2,    // 月亮層稍快
            back: 0.3,    // 遠景雲層
            mid: 0.5,     // 中景雲層
            front: 0.7,   // 近景雲層
            floor: 1.0    // 最前景移動最快
        };

        // 更新每層的滾動位置 - 遍歷所有背景層
        Object.keys(this.backgroundLayers).forEach(layerName => {
            const layer = this.backgroundLayers[layerName];  // 獲取背景層物件
            const speed = speeds[layerName] || 0.5;      // 獲取該層的滾動速度

            if (layer && layer.visible) {                // 檢查層是否存在且可見
                // 更新滾動位置 - 累加滾動偏移量
                this.scrollPositions[layerName] += speed;
                layer.tilePositionX = this.scrollPositions[layerName];  // 應用水平滾動
            }
        });
    }

    registerResponsiveElements() {
        // 將所有元素註冊到響應式系統 - 用於螢幕尺寸變化時的自動調整
        this.responsiveElements = [
            ...this.testElements                         // 展開測試元素陣列
        ];

        // 註冊視差背景層到響應式系統 - 確保背景層能適應螢幕尺寸變化
        if (this.backgroundLayers) {                     // 檢查背景層是否存在
            Object.values(this.backgroundLayers).forEach(layer => {  // 遍歷所有背景層
                if (layer) {                             // 檢查層是否有效
                    this.responsiveElements.push({       // 添加到響應式元素陣列
                        onResize: () => {                // 定義尺寸變化時的回調函數
                            // 響應式調整背景層尺寸 - 根據新的螢幕尺寸調整背景
                            const { width, height } = this;
                            layer.setSize(width, height);  // 設置背景層新尺寸
                        }
                    });
                }
            });
        }
    }

    /**
     * 🚀 更新太空船（非物理移動）- 處理太空船的移動邏輯和邊界限制
     */
    updateSpaceship() {
        if (!this.player || !this.cursors) return;      // 防禦性檢查

        const { height } = this;                         // 獲取場景高度
        const moveSpeed = 4;                             // 每幀移動像素數

        // 鍵盤控制邏輯 - 處理方向鍵和WASD鍵輸入
        if (this.cursors.up.isDown || this.wasd.W.isDown) {      // 檢查上方向鍵或W鍵
            this.player.y -= moveSpeed;                  // 向上移動
        } else if (this.cursors.down.isDown || this.wasd.S.isDown) {  // 檢查下方向鍵或S鍵
            this.player.y += moveSpeed;                  // 向下移動
        }

        // 點擊移動到目標位置（平滑移動） - 實現平滑的點擊移動效果
        if (Math.abs(this.player.y - this.playerTargetY) > 2) {  // 檢查是否需要移動到目標位置
            const direction = this.playerTargetY > this.player.y ? 1 : -1;  // 計算移動方向
            this.player.y += direction * moveSpeed;      // 向目標位置移動
        }

        // 限制太空船在合理的垂直範圍內 - 防止太空船移出螢幕
        if (this.player.y < 80) {                        // 檢查上邊界
            this.player.y = 80;                          // 限制在上邊界
        }
        if (this.player.y > height - 80) {               // 檢查下邊界
            this.player.y = height - 80;                 // 限制在下邊界
        }

        // 更新目標位置以防超出邊界 - 確保目標位置也在有效範圍內
        this.playerTargetY = Math.max(80, Math.min(height - 80, this.playerTargetY));
    }

    /**
     * 場景更新函數
     */
    update() {
        if (!this.sceneStopped) {
            this.updateParallaxBackground();
            this.updateSpaceship();
            this.updateEnemies();
        }
    }
}
