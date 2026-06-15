(function () {
  var USER = "RajaAsjad";

  var LANG_COLORS = {
    PHP: "#9B30FF",
    JavaScript: "#f1e05a",
    HTML: "#e34c26",
    CSS: "#563d7c",
    Vue: "#41b883",
    Blade: "#f55247",
    SCSS: "#c6538c",
    TypeScript: "#3178c6",
    Python: "#3572A5",
    Java: "#b07219"
  };

  function formatNum(n) {
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    return String(n);
  }

  function setText(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function gradeFromScore(score) {
    if (score >= 120) return "A+";
    if (score >= 80) return "A";
    if (score >= 50) return "B+";
    if (score >= 25) return "B";
    return "C";
  }

  function langColor(name) {
    return LANG_COLORS[name] || "#00e5ff";
  }

  async function fetchJson(url) {
    var res = await fetch(url);
    if (!res.ok) throw new Error(url);
    return res.json();
  }

  async function getRepos() {
    var repos = [];
    var page = 1;
    while (page <= 3) {
      var batch = await fetchJson(
        "https://api.github.com/users/" + USER + "/repos?per_page=100&page=" + page
      );
      if (!batch.length) break;
      repos = repos.concat(batch);
      if (batch.length < 100) break;
      page += 1;
    }
    return repos;
  }

  async function loadOverallStats(repos) {
    var stars = repos.reduce(function (sum, r) { return sum + (r.stargazers_count || 0); }, 0);

    var prs = 0;
    var issues = 0;
    try {
      prs = (await fetchJson(
        "https://api.github.com/search/issues?q=author:" + USER + "+type:pr&per_page=1"
      )).total_count || 0;
      issues = (await fetchJson(
        "https://api.github.com/search/issues?q=author:" + USER + "+type:issue&per_page=1"
      )).total_count || 0;
    } catch (e) { /* search API may rate-limit */ }

    var contributed = repos.filter(function (r) { return !r.fork; }).length;

    setText("stat-stars", formatNum(stars));
    setText("stat-prs", formatNum(prs));
    setText("stat-contributed", formatNum(contributed));

    var score = stars * 2 + prs + contributed * 2;
    var grade = gradeFromScore(score);
    setText("stat-grade", grade);

    return { stars: stars, prs: prs, contributed: contributed, grade: grade };
  }

  async function loadLanguages(repos) {
    var totals = {};
    var topRepos = repos.slice(0, 15);

    await Promise.all(topRepos.map(async function (repo) {
      try {
        var data = await fetchJson(repo.languages_url);
        Object.keys(data).forEach(function (lang) {
          totals[lang] = (totals[lang] || 0) + data[lang];
        });
      } catch (e) { /* skip */ }
    }));

    var entries = Object.keys(totals).map(function (k) {
      return { name: k, bytes: totals[k] };
    }).sort(function (a, b) { return b.bytes - a.bytes; }).slice(0, 5);

    var sum = entries.reduce(function (s, e) { return s + e.bytes; }, 0) || 1;
    var container = document.getElementById("lang-bars");
    if (!container) return;

    container.innerHTML = entries.map(function (item) {
      var pct = ((item.bytes / sum) * 100).toFixed(1);
      var color = langColor(item.name);
      return (
        '<div class="lang-row">' +
          '<div class="lang-meta">' +
            '<span class="lang-dot" style="background:' + color + '"></span>' +
            '<span class="lang-name">' + item.name + '</span>' +
            '<span class="lang-pct">' + pct + '%</span>' +
          '</div>' +
          '<div class="lang-track"><div class="lang-fill" style="width:' + pct + '%;background:' + color + '"></div></div>' +
        '</div>'
      );
    }).join("");
  }

  function levelFromApi(level) {
    var map = { NONE: 0, FIRST: 1, SECOND: 2, THIRD: 3, FOURTH: 4 };
    if (typeof level === "number") return Math.min(level, 4);
    return map[level] || 0;
  }

  function flattenContributions(data) {
    var weeks = data.contributions || [];
    var days = [];

    weeks.forEach(function (week) {
      var items = Array.isArray(week) ? week : (week.value || []);
      items.forEach(function (day) {
        days.push({
          count: day.contributionCount != null ? day.contributionCount : (day.count || 0),
          level: levelFromApi(day.contributionLevel != null ? day.contributionLevel : day.level)
        });
      });
    });

    return days;
  }

  async function loadContributions() {
    try {
      var data = await fetchJson("https://github-contributions-api.deno.dev/" + USER + ".json");
      var list = flattenContributions(data);
      var recent = list.slice(-84);
      var totalCommits = data.totalContributions || list.reduce(function (s, d) {
        return s + (d.count || 0);
      }, 0);

      var streak = 0;
      var maxStreak = 0;
      var run = 0;

      list.forEach(function (day) {
        if (day.count > 0) {
          run += 1;
          maxStreak = Math.max(maxStreak, run);
        } else {
          run = 0;
        }
      });

      for (var i = list.length - 1; i >= 0; i -= 1) {
        if (list[i].count > 0) streak += 1;
        else break;
      }

      setText("stat-streak", String(streak || maxStreak || 0));
      setText("stat-commits", formatNum(totalCommits));

      var grid = document.getElementById("contrib-grid");
      if (grid) {
        grid.innerHTML = recent.map(function (day) {
          return '<span class="contrib-cell level-' + day.level + '"></span>';
        }).join("");
      }
    } catch (e) {
      setText("stat-streak", "0");
      setText("stat-commits", "0");
    }
  }

  async function init() {
    try {
      var repos = await getRepos();
      await Promise.all([
        loadOverallStats(repos),
        loadLanguages(repos),
        loadContributions()
      ]);
    } catch (e) {
      setText("stat-stars", "0");
      setText("stat-commits", "0");
      setText("stat-prs", "0");
      setText("stat-contributed", "0");
      setText("stat-streak", "0");
      setText("stat-grade", "B");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
