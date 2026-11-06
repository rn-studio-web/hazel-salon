/* =========================================================
   hair salon Hazel　共通の動き
   ・JavaScript＝ボタンを押したときなどの「動き」を決めるファイルです
   ・外部のライブラリ（他の人が作った部品）は使っていません
   ========================================================= */

// JavaScriptが動いていることをCSSに伝える（動かないときは全部最初から表示）
document.documentElement.classList.remove('no-js');

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- 1. ハンバーガーメニューの開け閉め ---------- */
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('global-nav');

  function closeMenu() {
    document.body.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'メニューを開く');
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var isOpen = document.body.classList.toggle('menu-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      toggle.setAttribute('aria-label', isOpen ? 'メニューを閉じる' : 'メニューを開く');
    });

    // メニューの中のリンクを押したら閉じる
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    // Escキーでも閉じる
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('menu-open')) {
        closeMenu();
        toggle.focus();
      }
    });

    // PCの幅に広げたら、開いたままにならないよう閉じる
    window.matchMedia('(min-width: 1024px)').addEventListener('change', closeMenu);
  }

  /* ---------- 2. スクロールしたらヘッダーに線を出す ---------- */
  var header = document.querySelector('.site-header');
  function onScroll() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 3. スクロールでふわっと表示 ----------
     .reveal が付いた部品が画面に入ったら .is-visible を付けます。
     同じかたまりの中の部品は 0.06秒ずつずらして出します */
  var reveals = document.querySelectorAll('.reveal');

  document.querySelectorAll('[data-stagger]').forEach(function (group) {
    group.querySelectorAll('.reveal').forEach(function (el, i) {
      el.style.setProperty('--delay', (i * 0.06) + 's');
    });
  });

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // 一度出たら見張りをやめる
        }
      });
    }, { rootMargin: '0px 0px -8% 0px' });

    reveals.forEach(function (el) { observer.observe(el); });
  } else {
    // 古いブラウザではすぐに全部表示
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- 4. フッターの年号を自動で今年にする ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- 5. スタイル事例の絞り込み（staff.html） ----------
     タブを押すと、data-cat が同じ写真だけを表示します */
  var tabs = document.querySelectorAll('.style-tab');
  var styleItems = document.querySelectorAll('.style-item');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var filter = tab.getAttribute('data-filter');

      // 押したタブだけ「選ばれている」状態にする
      tabs.forEach(function (t) {
        t.setAttribute('aria-pressed', t === tab ? 'true' : 'false');
      });

      // 絞り込み中かどうかを、写真の並びに伝える（CSSで並べ方を変えるため）
      var grid = document.querySelector('.style-grid');
      if (grid) grid.classList.toggle('is-filtered', filter !== 'all');

      // 写真を出し分ける（出た写真は、ふわっと表示）
      styleItems.forEach(function (item) {
        var show = filter === 'all' || item.getAttribute('data-cat') === filter;
        item.hidden = !show;
        item.classList.remove('is-shown');
        if (show) {
          void item.offsetWidth; // 動きをもう一度最初から再生するためのおまじない
          item.classList.add('is-shown');
        }
      });
    });
  });

  /* ---------- 6. 写真を押すと大きく表示（staff.html） ----------
     ブラウザに最初から入っている <dialog> を使っています */
  var modal = document.getElementById('style-modal');

  if (modal && typeof modal.showModal === 'function') {
    var modalImg = modal.querySelector('.style-modal-img');
    var modalCaption = modal.querySelector('.style-modal-caption');
    var lastOpener = null;

    document.querySelectorAll('.style-open').forEach(function (button) {
      button.addEventListener('click', function () {
        var img = button.querySelector('img');
        modalImg.src = img.currentSrc || img.src;
        modalImg.alt = img.alt;
        modalCaption.textContent = button.getAttribute('data-caption');
        lastOpener = button;
        modal.showModal();
        document.body.classList.add('modal-open');
      });
    });

    // 閉じる処理（後片付けもここでまとめて行う）
    function closeModal() {
      if (modal.open) modal.close();
      document.body.classList.remove('modal-open');
      if (lastOpener) lastOpener.focus(); // 元の写真のボタンに戻る
    }

    // 閉じるボタン、または写真の外（暗いところ）を押したら閉じる
    modal.querySelector('.style-modal-close').addEventListener('click', closeModal);
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal();
    });

    // Escキーで閉じたとき
    modal.addEventListener('cancel', function (e) {
      e.preventDefault();
      closeModal();
    });
    modal.addEventListener('close', function () {
      document.body.classList.remove('modal-open');
    });
  }

  /* ---------- 7. よくある質問の開け閉め（access.html） ----------
     質問を押すと答えが開き、もう一度押すと閉じます */
  document.querySelectorAll('.faq-toggle').forEach(function (button) {
    button.addEventListener('click', function () {
      var item = button.closest('.faq-item');
      var isOpen = item.classList.toggle('is-open');
      button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  });

  /* ---------- 8. お悩みから選ぶメニュー（index.html） ----------
     お悩みのボタンを押すと、そのおすすめメニューだけを表示します */
  var concernTabs = document.querySelectorAll('.concern-tab');
  concernTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      concernTabs.forEach(function (t) {
        t.setAttribute('aria-pressed', t === tab ? 'true' : 'false');
      });
      document.querySelectorAll('.concern-panel').forEach(function (panel) {
        panel.classList.toggle('is-active', panel.id === tab.getAttribute('data-target'));
      });
    });
  });
});
