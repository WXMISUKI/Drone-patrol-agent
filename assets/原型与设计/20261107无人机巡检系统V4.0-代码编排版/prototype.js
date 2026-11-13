/* =========================================================
   V4.0 原型交互脚本 · 无依赖
   ========================================================= */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- 当前页导航 ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href="#"]') : null;
    if (a) e.preventDefault();
  });
  var pageMap = {
    'web-command-center.html': 'nav-command',
    'web-mission-plan.html': 'nav-plan',
    'web-mission-detail.html': 'nav-detail',
    'web-hazard-review.html': 'nav-review',
    'web-process-monitor.html': 'nav-process',
    'web-hazard-closure.html': 'nav-closure',
    'web-reports.html': 'nav-reports',
    'web-knowledge.html': 'nav-knowledge',
    'web-admin.html': 'nav-admin',
    'handoff.html': 'nav-handoff'
  };
  var file = location.pathname.split('/').pop() || 'index.html';
  var activeId = pageMap[file];
  if (activeId) {
    var navEl = document.getElementById(activeId);
    if (navEl) navEl.classList.add('is-active');
  }

  /* ---------- 角色切换 ---------- */
  var roleNames = { supervisor: '监理工程师', owner: '建设单位', builder: '施工安全员' };
  function setRole(role) {
    document.body.setAttribute('data-role', role);
    $$('[data-role-btn]').forEach(function (b) {
      b.classList.toggle('is-on', b.getAttribute('data-role-btn') === role);
    });
    $$('[data-role-show]').forEach(function (el) {
      var allow = (el.getAttribute('data-role-show') || '').split(/\s+/);
      el.style.display = allow.indexOf(role) > -1 ? '' : 'none';
    });
    $$('[data-role-name]').forEach(function (el) { el.textContent = roleNames[role] || role; });
    var cur = $('#roleLabel');
    if (cur) cur.textContent = roleNames[role] || role;
  }
  $$('[data-role-btn]').forEach(function (b) {
    b.addEventListener('click', function () {
      setRole(b.getAttribute('data-role-btn'));
      toast('已切换至「' + roleNames[b.getAttribute('data-role-btn')] + '」视角，菜单与操作权限已同步。');
    });
  });

  /* ---------- 标签页 ---------- */
  $$('[data-tab-group]').forEach(function (group) {
    var buttons = $$('[data-tab]', group);
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var key = btn.getAttribute('data-tab');
        buttons.forEach(function (b) { b.classList.toggle('is-on', b === btn); });
        $$('[data-tab-panel]', document).forEach(function (p) {
          if (p.getAttribute('data-tab-scope') && p.getAttribute('data-tab-scope') !== group.getAttribute('data-tab-group')) return;
          p.hidden = p.getAttribute('data-tab-panel') !== key;
        });
      });
    });
  });

  /* ---------- 筛选 ---------- */
  $$('[data-filters]').forEach(function (group) {
    var btns = $$('button[data-filter]', group);
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-filter');
        btns.forEach(function (b) { b.classList.toggle('is-on', b === btn); });
        var scopeSel = group.getAttribute('data-filters');
        var rows = $$(scopeSel + ' [data-row]');
        var shown = 0;
        rows.forEach(function (row) {
          var vals = (row.getAttribute('data-row') || '').split(/\s+/);
          var ok = key === 'all' || vals.indexOf(key) > -1;
          row.style.display = ok ? '' : 'none';
          if (ok) shown++;
        });
        $$('[data-filter-count]').forEach(function (el) { el.textContent = shown; });
        var empty = $('[data-filter-empty]');
        if (empty) empty.hidden = shown !== 0;
      });
    });
  });

  /* ---------- 开关 / 分段 ---------- */
  $$('.switch').forEach(function (s) {
    s.addEventListener('click', function () { s.classList.toggle('is-on'); });
  });
  $$('.segmented').forEach(function (seg) {
    var btns = $$('button', seg);
    btns.forEach(function (b) {
      b.addEventListener('click', function () { btns.forEach(function (x) { x.classList.toggle('is-on', x === b); }); });
    });
  });

  /* ---------- 弹层 ---------- */
  function openModal(id) {
    var m = document.getElementById(id);
    if (!m) return;
    m.classList.add('is-open');
    var first = m.querySelector('input, textarea, select, button.btn-primary');
    if (first) setTimeout(function () { first.focus(); }, 60);
  }
  function closeModal(m) { if (m) m.classList.remove('is-open'); }
  $$('[data-modal]').forEach(function (btn) {
    btn.addEventListener('click', function () { openModal(btn.getAttribute('data-modal')); });
  });
  $$('[data-close]').forEach(function (btn) {
    btn.addEventListener('click', function () { closeModal(btn.closest('.modal-mask')); });
  });
  $$('.modal-mask').forEach(function (mask) {
    mask.addEventListener('click', function (e) { if (e.target === mask) closeModal(mask); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') $$('.modal-mask.is-open').forEach(closeModal);
  });

  /* ---------- Toast ---------- */
  function toast(msg, tone) {
    var wrap = $('.toast-wrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.className = 'toast-wrap';
      document.body.appendChild(wrap);
    }
    var el = document.createElement('div');
    el.className = 'toast' + (tone ? ' ' + tone : '');
    el.innerHTML = '<span class="t-ico">✓</span><span>' + msg + '</span>';
    wrap.appendChild(el);
    setTimeout(function () {
      el.style.transition = 'opacity .25s, transform .25s';
      el.style.opacity = '0';
      el.style.transform = 'translateY(6px)';
      setTimeout(function () { el.remove(); }, 260);
    }, 3600);
  }
  window.demoToast = toast;
  $$('[data-toast]').forEach(function (btn) {
    btn.addEventListener('click', function () { toast(btn.getAttribute('data-toast')); });
  });

  /* ---------- 复制 ---------- */
  $$('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var val = btn.getAttribute('data-copy');
      if (val.charAt(0) === '#') {
        var t = $(val);
        val = t ? (t.textContent || '').trim() : '';
      }
      if (navigator.clipboard) navigator.clipboard.writeText(val);
      toast('已复制：' + val);
    });
  });

  /* ---------- 隐患复核裁决 ---------- */
  var verdicts = {
    confirm: { state: 'PENDING_RECTIFY', label: '待整改', cls: 'badge-pending', msg: '已确认隐患并自动生成整改工单，流程进入 PENDING_RECTIFY。' },
    reject: { state: 'REJECTED', label: '已关闭', cls: 'badge-draft', msg: '已标注误报并关闭流程，样本回流至模型优化队列。' },
    uncertain: { state: 'PENDING_HUMAN_REVIEW', label: '待现场核实', cls: 'badge-ai', msg: '已标记为 uncertain，转派监理现场核实，流程保持人工闸门。' }
  };
  $$('[data-verdict]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var v = verdicts[btn.getAttribute('data-verdict')];
      if (!v) return;
      $$('[data-verdict]').forEach(function (b) { b.classList.add('is-disabled'); b.setAttribute('disabled', 'disabled'); });
      $$('[data-review-action]').forEach(function (b) { b.classList.add('is-disabled'); b.setAttribute('disabled', 'disabled'); });
      $$('[data-instance-state]').forEach(function (el) {
        el.textContent = v.state;
        el.className = 'badge ' + v.cls;
      });
      $$('[data-instance-state-text]').forEach(function (el) { el.textContent = v.label; });
      $$('[data-after-verdict]').forEach(function (el) { el.style.display = ''; });
      var rail = $('[data-verdict-rail]');
      if (rail) {
        var act = rail.querySelector('.rail-step.active');
        if (act) {
          act.classList.remove('active');
          if (btn.getAttribute('data-verdict') === 'reject') act.classList.add('fail');
          else act.classList.add('done');
          var next = act.nextElementSibling;
          if (next) next.classList.add('active');
        }
      }
      toast(v.msg);
    });
  });

  /* ---------- 整改销号 ---------- */
  $$('[data-close-hazard]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      $$('[data-closure-state]').forEach(function (el) {
        el.textContent = 'CLOSED';
        if (el.classList.contains('badge')) {
          el.className = 'badge badge-closed';
          el.innerHTML = '<i></i>CLOSED';
        } else {
          el.style.color = 'var(--teal)';
        }
      });
      var rail = $('[data-closure-rail]');
      if (rail) {
        var steps = $$('.rail-step', rail);
        steps.forEach(function (s, i) {
          s.classList.remove('active');
          s.classList.remove('blocked');
          if (i < steps.length - 1) s.classList.add('done');
        });
        if (steps.length) steps[steps.length - 1].classList.add('active');
      }
      $$('.page-actions .btn-teal, .page-actions .btn-danger').forEach(function (b) {
        b.classList.add('is-disabled');
      });
    });
  });

  /* ---------- 前后对比滑块 ---------- */
  $$('.compare').forEach(function (cmp) {
    var range = cmp.querySelector('input[type=range]');
    var after = cmp.querySelector('.after-wrap');
    var handle = cmp.querySelector('.handle');
    if (!range || !after) return;
    function sync() {
      var v = range.value;
      after.style.width = v + '%';
      if (handle) handle.style.left = v + '%';
      var afterImg = after.querySelector('img');
      if (afterImg) afterImg.style.width = cmp.clientWidth + 'px';
    }
    range.addEventListener('input', sync);
    window.addEventListener('resize', sync);
    sync();
  });

  /* ---------- 回放时间轴 ---------- */
  $$('[data-playback]').forEach(function (range) {
    var frames;
    try { frames = JSON.parse(range.getAttribute('data-playback')); } catch (e) { frames = null; }
    if (!frames) return;
    var scope = range.closest('[data-play-scope]') || document;
    function sync() {
      var f = frames[Math.min(parseInt(range.value, 10), frames.length - 1)];
      $$('[data-field]', scope).forEach(function (el) {
        var k = el.getAttribute('data-field');
        if (f[k] !== undefined) el.textContent = f[k];
      });
      $$('[data-field-width]', scope).forEach(function (el) {
        var k = el.getAttribute('data-field-width');
        if (f[k] !== undefined) el.style.width = f[k];
      });
    }
    range.addEventListener('input', sync);
    sync();
  });

  /* ---------- 任务编排步骤 ---------- */
  (function () {
    var wiz = $('[data-wiz]');
    if (!wiz) return;
    var steps = $$('.wiz-step', wiz);
    var panes = $$('[data-wiz-pane]');
    var cur = 1;
    function show(n) {
      cur = Math.max(1, Math.min(n, panes.length));
      steps.forEach(function (s, i) {
        s.classList.toggle('is-on', i + 1 === cur);
        s.classList.toggle('is-done', i + 1 < cur);
      });
      panes.forEach(function (p) { p.hidden = parseInt(p.getAttribute('data-wiz-pane'), 10) !== cur; });
      $$('[data-wiz-pager]').forEach(function (pager) {
        pager.textContent = '步骤 ' + cur + ' / ' + panes.length;
      });
    }
    $$('[data-wiz-next]').forEach(function (b) { b.addEventListener('click', function () { show(cur + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }); });
    $$('[data-wiz-prev]').forEach(function (b) { b.addEventListener('click', function () { show(cur - 1); }); });
    show(1);

    var runBtn = $('[data-run-checks]');
    if (runBtn) {
      runBtn.addEventListener('click', function () {
        var items = $$('[data-check-item]');
        var badge = $('[data-check-badge]');
        runBtn.classList.add('is-disabled');
        runBtn.textContent = '检查中…';
        if (badge) { badge.className = 'badge badge-pending'; badge.textContent = '检查中'; }
        items.forEach(function (item, i) {
          item.classList.remove('ok');
          item.querySelector('.ci-ico').textContent = String(i + 1);
          var st0 = item.querySelector('[data-check-state]');
          if (st0) st0.textContent = '待检查';
          var bar0 = item.querySelector('.progress i');
          if (bar0) bar0.style.width = '0';
          setTimeout(function () {
            item.classList.add('ok');
            item.querySelector('.ci-ico').textContent = '✓';
            var st = item.querySelector('[data-check-state]');
            if (st) st.textContent = '通过';
            var bar = item.querySelector('.progress i');
            if (bar) bar.style.width = '100%';
          }, 260 * (i + 1));
        });
        setTimeout(function () {
          runBtn.classList.remove('is-disabled');
          runBtn.textContent = '重新检查';
          if (badge) { badge.className = 'badge badge-closed'; badge.innerHTML = '<i></i>全部通过'; }
          toast('空域、气象、电子围栏与设备状态检查通过，任务可下发。');
        }, 260 * (items.length + 1));
      });
    }
  })();

  /* ---------- 报告生成 ---------- */
  (function () {
    var btn = $('[data-generate-report]');
    if (!btn) return;
    var modal = $('#reportModal');
    var bar = $('#reportProgress');
    var stage = $('#reportStage');
    var done = $('#reportDone');
    var start = $('#reportStart');
    var stages = ['聚合巡视任务与影像元数据…', '拉取隐患台账与整改状态…', '按模板计算统计口径…', '生成正文与证据附图…', '写入版本号并归档…'];
    function reset() {
      if (bar) bar.style.width = '0%';
      if (stage) stage.textContent = '等待开始';
      if (done) done.hidden = true;
      if (start) { start.classList.remove('is-disabled'); start.textContent = '开始生成'; }
    }
    btn.addEventListener('click', function () { reset(); openModal('reportModal'); });
    if (start) {
      start.addEventListener('click', function () {
        start.classList.add('is-disabled');
        start.textContent = '生成中…';
        var i = 0;
        var timer = setInterval(function () {
          if (bar) bar.style.width = Math.round((i + 1) / stages.length * 100) + '%';
          if (stage) stage.textContent = stages[i];
          i++;
          if (i >= stages.length) {
            clearInterval(timer);
            if (done) done.hidden = false;
            if (start) { start.classList.remove('is-disabled'); start.textContent = '关闭'; }
            toast('报告草稿已生成：BG-20261107-003 · V1.0，已进入待审核队列。');
          }
        }, 650);
      });
    }
  })();

  /* ---------- 问答 ---------- */
  (function () {
    var form = $('[data-chat]');
    if (!form) return;
    var input = form.querySelector('input');
    var list = $('[data-chat-list]');
    var answers = [
      {
        re: /临边|栏杆|高处|坠落/,
        html: '<p>该场景属于<b>临边作业防护缺失</b>，判定依据如下：</p><ul><li>临边防护栏杆应设置上、中两道横杆，上杆高度 1.2m，立杆间距不大于 2m。</li><li>基坑、墩柱作业面外侧无防护或防护被拆除未恢复的，按重大隐患处置。</li><li>涉及高处作业的，作业人员应系挂安全带并设置可靠挂点。</li></ul><p class="small muted" style="margin-top:6px">已检索 4 部规范、12 条历史案例，引用 2 条。</p>',
        refs: ['JTG F90-2015 §4.3.7', 'JGJ 80-2016 §4.1.2']
      },
      {
        re: /脚手架|支架|连墙/,
        html: '<p>脚手架连墙件缺失的处置口径：</p><ul><li>连墙件应随架体同步搭设，缺失或间距超标应立即停用该段架体。</li><li>整改前需设置临时拉结与警戒隔离，禁止人员在架体上作业。</li><li>复核时应抽查连墙件数量、间距与扣件扭矩，并留存影像。</li></ul>',
        refs: ['JGJ 130-2011 §6.4.1', 'JTG F90-2015 §5.2.6']
      },
      {
        re: /裸土|扬尘|环保|覆盖/,
        html: '<p>裸土未覆盖属于环保类一般隐患，判定与整改要求：</p><ul><li>裸露土方应使用密目网覆盖，覆盖率不低于 95%，接缝搭接不小于 10cm。</li><li>土方作业面应配套洒水降尘，出入口设置车辆冲洗设施。</li><li>连续 3 日未整改的，纳入项目环保约谈清单。</li></ul>',
        refs: ['JTG F90-2015 §7.4.2', '企业制度 · 文明施工管理办法 §12']
      }
    ];
    var fallback = {
      html: '<p>当前知识库未检索到可直接支撑该问题的条文。为避免编造，系统不作推断。</p><p>建议补充规范名称、构件类型或桩号后重试；也可转人工专家答复。</p>',
      refs: []
    };
    function bubble(role, html, refs) {
      var el = document.createElement('div');
      el.className = 'msg' + (role === 'user' ? ' user' : '');
      el.innerHTML = '<div class="m-ava">' + (role === 'user' ? '陈' : 'AI') + '</div>' +
        '<div class="m-body"><div class="m-name">' + (role === 'user' ? '我 · 监理工程师' : '知识问答 Worker · Qwen-Plus') + '</div>' +
        '<div class="bubble">' + html + (refs && refs.length ? '<div class="refs">' + refs.map(function (r) { return '<span class="tag tag-brand">' + r + '</span>'; }).join('') + '</div>' : '') +
        '</div></div>';
      list.appendChild(el);
      list.scrollTop = list.scrollHeight;
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = (input.value || '').trim();
      if (!q) return;
      bubble('user', '<p>' + q.replace(/</g, '&lt;') + '</p>');
      input.value = '';
      var typing = document.createElement('div');
      typing.className = 'msg';
      typing.innerHTML = '<div class="m-ava">AI</div><div class="m-body"><div class="m-name">知识问答 Worker · 检索中</div><div class="bubble"><span class="typing"><i></i><i></i><i></i></span></div></div>';
      list.appendChild(typing);
      list.scrollTop = list.scrollHeight;
      setTimeout(function () {
        typing.remove();
        var hit = null;
        answers.forEach(function (a) { if (a.re.test(q)) hit = a; });
        var ans = hit || fallback;
        bubble('ai', ans.html, ans.refs);
      }, 900);
    });
    $$('[data-ask]').forEach(function (chip) {
      chip.addEventListener('click', function () {
        input.value = chip.getAttribute('data-ask');
        form.dispatchEvent(new Event('submit'));
      });
    });
  })();

  /* ---------- 固定演示时钟 ---------- */
  $$('[data-demo-date]').forEach(function (el) {
    el.textContent = el.getAttribute('data-demo-date') || '2026-11-07 周六';
  });
  $$('[data-demo-time]').forEach(function (el) {
    el.textContent = el.getAttribute('data-demo-time') || '10:42';
  });

  /* ---------- 图表入场 ---------- */
  document.documentElement.classList.add('js-ready');
})();