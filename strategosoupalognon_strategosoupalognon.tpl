{OVERALL_GAME_HEADER}

<!-- 
--------
-- BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
-- ReversiTutorialSoupa implementation : © Gabriel Durand <gabriel.durand@hotmail.fr>
-- 
-- This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
-- See http://en.boardgamearena.com/#!doc/Studio for more information.
-------
-->

<a href="#" id="endTurnButton" class="bgabutton bgabutton_blue"><span>End your turn</span></a>

<div id="board">
    <!-- BEGIN square -->
        <div id="square_{X}_{Y}" class="square" style="left: {LEFT}px; top: {TOP}px;"></div>
    <!-- END square -->

    <div id="soldiers">
    </div>

    <div id="soldiersExplanation"></div>
 </div>

 

 <a href="#" id="PutBackOnHand" class="bgabutton bgabutton_blue"><span>Put back on hand</span></a>

 <div id="myhand_wrap" class="whiteblock">
    <h3>{MY_HAND}</h3>
    <div class="playersoldiers" id="myhand">
    </div>
</div>

<script type="text/javascript">

    var jstpl_soldiers = '<div class="soldiers" id="soldier_${id}" style="background-position:-${x}px 0px">\
                            </div>';

</script>  

{OVERALL_GAME_FOOTER}
