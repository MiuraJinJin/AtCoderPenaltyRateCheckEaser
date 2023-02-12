// ==UserScript==
// @name         AtCoderPenaltyRateCheckEaser
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  提出フォームの上にペナルティ率を表示して、提出前に確認しやすくします
// @author       Masaoki Seta
// @match        https://atcoder.jp/contests/*/tasks/*
// @license      MIT
// ==/UserScript==

function getStandingsData(contestName) {
    const REQUEST_URL = `https://atcoder.jp/contests/${contestName}/standings/json`;
    return $.ajax({
        type: 'GET',
        url: REQUEST_URL,
        dataType: 'json',
    })
    .fail(() => console.error(`AtCoderPenaltyRateCheckEaser: Could not get data in function, getStandingsData. Request URL : ${REQUEST_URL}`));
}

$(() => {
    'use strict';

    if (!'contestScreenName' in window) {
        console.error('AtCoderPenaltyRateCheckEaser: Could not get contestScreenName.');
        return;
    }

    function gotPenalty(preblemData) {
        if (preblemData.Penalty > 0) return true;
        if (preblemData.Failure > 0 && preblemData.Status !== 1) return true;
        return false;
    }

     const PROBLEM_NAME = location.href.split('/').pop();

     getStandingsData(contestScreenName).done((res) => {
         const standingsData = res.StandingsData;
         let totalCount = 0, penaltyCount = 0;
         standingsData.forEach((userData) => {
             const preblemData = userData.TaskResults[PROBLEM_NAME];
             if (preblemData == null) return;
             totalCount++;
             if (gotPenalty(preblemData)) penaltyCount++;
      });
      const panaltyRate = penaltyCount * 100/totalCount;
      const panaltyRateStr = totalCount > 0 ? (panaltyRate).toFixed(2) : 'No Submit';
      const rateStyle = (() => {
          let style = '';
          if (panaltyRate >= 33.3) style = 'background: red;';
          else if (panaltyRate >= 20.0) style = 'background: yellow;';
          return style;
      })();
      $('.form-horizontal.form-code-submit').prepend(`
<div>
  <table id="acsa-table" class="table table-bordered table-hover th-center td-center td-middle">
    <thead>
      <th style="width: 50%">ノーペナ人数/提出人数</th>
      <th style="width: 50%">ペナルティ率</th>
    </thead>
    <tbody>
      <td>${ totalCount - penaltyCount }/${ totalCount }</td>
      <td style="${ rateStyle }">${ panaltyRateStr }%</td>
    </tbody>
  </table>
</div>
      `);
  });
});