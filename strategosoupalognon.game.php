<?php
 /**
  *------
  * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
  * StrategoSoupalognon implementation : © <Your name here> <Your email address here>
  * 
  * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
  * See http://en.boardgamearena.com/#!doc/Studio for more information.
  * -----
  * 
  * strategosoupalognon.game.php
  *
  * This is the main file for your game logic.
  *
  * In this PHP file, you are going to defines the rules of the game.
  *
  */


require_once( APP_GAMEMODULE_PATH.'module/table/table.game.php' );


class StrategoSoupalognon extends Table
{
	function __construct( )
	{
        // Your global variables labels:
        //  Here, you can assign labels to global variables you are using for this game.
        //  You can use any number of global variables with IDs between 10 and 99.
        //  If your game has options (variants), you also have to associate here a label to
        //  the corresponding ID in gameoptions.inc.php.
        // Note: afterwards, you can get/set the global variables with getGameStateValue/setGameStateInitialValue/setGameStateValue
        parent::__construct();
        
        self::initGameStateLabels( array( 
            "ChosenSoldierId" => 12,
            "FirstPlayerID" => 14,
            "SecondPlayerID" => 15,
            "ScoutSpecialActionX" => 16,
            "ScoutSpecialActionY" => 17,
        ) );   
	}
	
    protected function getGameName( )
    {
		// Used for translations and stuff. Please do not modify.
        return "strategosoupalognon";
    }	

    /*
        setupNewGame:
        
        This method is called only once, when a new game is launched.
        In this method, you must setup the game according to the game rules, so that
        the game is ready to be played.
    */
    protected function setupNewGame( $players, $options = array() )
    {    
        $soldier_id = 0;
        $sqlBoard = "INSERT INTO board (board_x, board_y, soldier_id) VALUES ";
        $sqlArgBoard = array();
        for($x=1; $x<=10; $x++) {
            for($y=1; $y<=10; $y++) {
                if(($y == 5 || $y ==6) && ($x == 3 || $x == 4 || $x == 7 || $x == 8))
                    $soldier_id = $this->LAKE;
                else
                    $soldier_id = $this->NO_SOLIDER;

                $sqlArgBoard[] = "('".$x."', '".$y."', '".$soldier_id."')";
            }
        }
        $sqlBoard .= implode( $sqlArgBoard, ',' );
        self::DbQuery( $sqlBoard );

        // Set the colors of the players with HTML color code
        // The default below is red/green/blue/orange/brown
        // The number of colors defined here must correspond to the maximum number of players allowed for the gams
        $gameinfos = self::getGameinfos();
        $default_colors = $gameinfos['player_colors'];
 
        // Create players and soldiers
        // Note: if you added some extra field on "player" table in the database (dbmodel.sql), you can initialize it there.
        $sqlPlayer = "INSERT INTO player (player_id, player_color, player_canal, player_name, player_avatar) VALUES ";
        $sqlSoldier = "INSERT INTO soldier (soldier_type, soldier_name, player_id) VALUES ";
        $sqlArgPlayer = array();
        $sqlArgSoldier = array();

        foreach( $players as $player_id => $player )
        {
            $color = array_shift( $default_colors );
            $sqlArgPlayer[] = "('".$player_id."','$color','".$player['player_canal']."','".addslashes( $player['player_name'] )."','".addslashes( $player['player_avatar'] )."')";

            foreach( $this->allSoldiers as $soldier ) {
                for($i=0; $i<$soldier['number_of_soldier']; $i++) {
                    $sqlArgSoldier[] = "('".$soldier['type']."', '".$soldier['name']."', '".$player_id."')";
                }
            }
        }
        $sqlPlayer .= implode( $sqlArgPlayer, ',' );
        self::DbQuery( $sqlPlayer );
        $sqlSoldier .= implode( $sqlArgSoldier, ',' );
        self::DbQuery( $sqlSoldier );
        self::reattributeColorsBasedOnPreferences( $players, $gameinfos['player_colors'] );
        self::reloadPlayersBasicInfos();


        //Create a cheat to start at a advanced turn
        $player_id = 2337782;
        {
            //Update board
            self::DbQuery("UPDATE board SET board_player = $player_id, soldier_type = 3, soldier_id = 1 WHERE (board_y = 6 AND board_x = 1)");
            self::DbQuery("UPDATE board SET board_player = $player_id, soldier_type = 2, soldier_id = 2 WHERE (board_y = 7 AND board_x = 5)");
            self::DbQuery("UPDATE board SET board_player = $player_id, soldier_type = 4, soldier_id = 3 WHERE (board_y = 5 AND board_x = 2)");
            self::DbQuery("UPDATE board SET board_player = $player_id, soldier_type = 5, soldier_id = 4 WHERE (board_y = 8 AND board_x = 7)");
        }

        $player_id = 2337783;
        {
            //Update board
            self::DbQuery("UPDATE board SET board_player = $player_id, soldier_type = 3, soldier_id = 5 WHERE (board_y = 5 AND board_x = 1)");
            self::DbQuery("UPDATE board SET board_player = $player_id, soldier_type = 0, soldier_id = 6 WHERE (board_y = 3 AND board_x = 5)");
            self::DbQuery("UPDATE board SET board_player = $player_id, soldier_type = 11, soldier_id = 7 WHERE (board_y = 4 AND board_x = 3)");
            self::DbQuery("UPDATE board SET board_player = $player_id, soldier_type = 3, soldier_id = 8 WHERE (board_y = 4 AND board_x = 9)");
        }

        //Init global value able to know if a soldier has been select for movement
        self::setGameStateInitialValue( 'ChosenSoldierId', 0 );

        //Save the player position on $players list, to be able to have the active player always at bottom screen
        self::setGameStateInitialValue( 'FirstPlayerID', (int)array_keys($players)[0] );
        self::setGameStateInitialValue( 'SecondPlayerID', (int)array_keys($players)[1] );
        self::setGameStateInitialValue( 'ScoutSpecialActionX', 0 );
        self::setGameStateInitialValue( 'ScoutSpecialActionY', 0 );
        
        // Init game statistics
        // (note: statistics used in this file must be defined in your stats.inc.php file)
        //self::initStat( 'table', 'table_teststat1', 0 );    // Init a table statistics
        //self::initStat( 'player', 'player_teststat1', 0 );  // Init a player statistics (for all players)

        // TODO: setup the initial game situation here
       

        // Activate first player (which is in general a good idea :) )
        $this->activeNextPlayer();

        /************ End of the game initialization *****/
    }

    /*
        getAllDatas: 
        
        Gather all informations about current game situation (visible by the current player).
        
        The method is called each time the game interface is displayed to a player, ie:
        _ when the game starts
        _ when a player refreshes the game page (F5)
    */
    protected function getAllDatas()
    {
        $result = array();
    
        $current_player_id = self::getCurrentPlayerId();    // !! We must only return informations visible by this player !!
    
        // Get information about players
        // Note: you can retrieve some extra field you added for "player" table in "dbmodel.sql" if you need it.
        $sql = "SELECT player_id id, player_score score FROM player ";
        $result['players'] = self::getCollectionFromDb( $sql );

        // if($this->gamestate->state()["name"] == "selectSoldier") {
            $sql = "SELECT soldier_id id, soldier_type type, soldier_name name FROM soldier WHERE player_id = $current_player_id";
            $result['hand'] = self::getCollectionFromDb( $sql );
        // }
        
        if($current_player_id == self::getActivePlayerId()) {
            $ChosenSoldierId = self::getGameStateValue( 'ChosenSoldierId' );
            $result['ChosenSoldierId'] = $ChosenSoldierId;
        }
        else {
            $result['ChosenSoldierId'] = $this->NO_SOLIDER;
        }

        $result['opponent_soldiers'] = self::getObjectListFromDB(
            "SELECT soldier_id id, board_x x, board_y y
             FROM board
             WHERE (board_player <> $current_player_id && board_player != 0) " );

        $result['player_soldiers'] = self::getObjectListFromDB(
            "SELECT soldier_id id, board_x x, board_y y, soldier_type type
            FROM board
            WHERE board_player = $current_player_id " );

        //If your are the second player, invert the board to see soldier at bottom
        if($current_player_id == self::getGameStateValue( 'SecondPlayerID' )) {
            foreach($result['opponent_soldiers'] as &$opponent_soldier) {
                $opponent_soldier['y'] = strval(11 - (int)$opponent_soldier['y']);
            }

            foreach($result['player_soldiers'] as &$player_soldier) {
                $player_soldier['y'] = strval(11 - (int)$player_soldier['y']);
            }
        }

        return $result;
    }

    /*
        getGameProgression:
        
        Compute and return the current game progression.
        The number returned must be an integer beween 0 (=the game just started) and
        100 (= the game is finished or almost finished).
    
        This method is called each time we are in a game state with the "updateGameProgression" property set to true 
        (see states.inc.php)
    */
    function getGameProgression()
    {
        // TODO: compute and return the game progression

        return 0;
    }


//////////////////////////////////////////////////////////////////////////////
//////////// Utility functions
////////////    

    function getOpponentID($player_id) {
        if($player_id == self::getGameStateValue( 'FirstPlayerID' ))
            return self::getGameStateValue( 'SecondPlayerID' );
        else
            return self::getGameStateValue( 'FirstPlayerID' );
    }

    function specialScoutMovement($to_x, $to_y, $from_x, $from_y) {
        $direction_x = ($to_x - $from_x);
        $direction_y = ($to_y - $from_y);
        if($direction_x > 0)
            $condition = "((board_x > $from_x AND board_x <= $to_x) AND (board_y = $to_y))";
        else if($direction_x < 0) 
            $condition = "((board_x < $from_x AND board_x >= $to_x) AND (board_y = $to_y))";
        else if($direction_y > 0) 
            $condition = "((board_x = $to_x) AND (board_y > $from_y AND board_y <= $to_y))";
        else if($direction_y < 0) 
            $condition = "((board_x = $to_x) AND (board_y < $from_y AND board_y >= $to_y))";

        //Identify if there are soldiers on the line
        $sql = "SELECT soldier_id soldier_id FROM board WHERE ($condition AND soldier_id != $this->NO_SOLIDER )";
        $soldiers = self::getCollectionFromDb( $sql );
        // self::dump( 'condition = ', $square);

        if(count($soldiers) > 0)    //If there is a soldier on the direction --> Error
            return 1;
        else
            return 0;
    }


//////////////////////////////////////////////////////////////////////////////
//////////// Player actions
//////////// 

    function endTurnSpecialScoutAction() {
        self::checkAction("endTurnSpecialScoutAction");
        $player_id = self::getActivePlayerId();

        $x = self::getGameStateValue( 'ScoutSpecialActionX' );
        $y = self::getGameStateValue( 'ScoutSpecialActionY' );
        $ChosenSoldierId = self::getGameStateValue( 'ChosenSoldierId' ) ;
        $SecondPlayerID = self::getGameStateValue( 'SecondPlayerID' );

        $sql = "SELECT player_id player_id FROM player";
        $players = self::getCollectionFromDb( $sql );

        $message = '${player_name} moves a soldier on board';
        $notification = 'moveSoldierEmptySquare';

        foreach($players as $database_player_id => $player) {
            if($player_id == $database_player_id) { //If you are the active player, do not the same info as before
                continue;
            }

            if($database_player_id == $SecondPlayerID)
                $yTmp = 11 - $y;
            else
                $yTmp = $y;

            self::notifyPlayer(
                $database_player_id,
                $notification, 
                clienttranslate($message), 
                array (
                    'x' => $x,
                    'y' => $yTmp,
                    'soldier_id' => $ChosenSoldierId,
                    'opponent_soldier_id' => 0,
                    'player_id' => $player_id,
                    'player_name' => $player_id //WRONG!!!!
                )
            );
        }

        self::setGameStateValue( 'ChosenSoldierId', 0 );   //Reset ID value

        $this->gamestate->nextState("moveSoldier");
    }

    function putBackOnHand($x, $y, $player_id) {
        // self::checkAction("putBackOnHand");

        $SecondPlayerID = self::getGameStateValue( 'SecondPlayerID' );
        if($player_id == $SecondPlayerID) {   //If the player_id is the second in the list
            $y = 11 - $y;   //Invert positon on the board
        }

        $sql = "SELECT board_player player_id, soldier_type soldier_type, soldier_id soldier_id FROM board WHERE (board_x = $x AND board_y = $y)";
        $square = self::getCollectionFromDb( $sql );

        $player_id = (int)array_keys($square)[0];
        $soldier_type = $square[$player_id]['soldier_type'];
        $soldier_id = $square[$player_id]['soldier_id'];

        //Update board
        self::DbQuery("UPDATE board SET board_player = $this->NO_PLAYER, soldier_type = $this->NO_TYPE, soldier_id = $this->NO_SOLIDER WHERE (board_x = $x AND board_y = $y)");

        //Add soldier to player hand
        self::DbQuery("INSERT INTO soldier (soldier_id, soldier_type, player_id) VALUES ( '".$soldier_id."', '".$soldier_type."', '".$player_id."')");
    }

    
    function placeSoldier($x, $y, $soldier_id, $type, $player_id) {
        // self::checkAction("");

        $SecondPlayerID = self::getGameStateValue( 'SecondPlayerID' );
        if($player_id == $SecondPlayerID) {   //If the player_id is the second in the list
            $y = 11 - $y;   //Invert positon on the board
            if($y > 4) {
                throw new BgaUserException ( 'You can only place your soldiers at the bottom part of the board' );
            }
        }
        else {
            if($y < 7) {
                throw new BgaUserException ( 'You can only place your soldiers at the bottom part of the board' );
            }
        }

        $sql = "SELECT soldier_id id FROM board WHERE (board_x = $x AND board_y = $y)";
        $square = self::getCollectionFromDb( $sql );
        if((int)array_keys($square)[0] != 0) {
            throw new BgaUserException ( 'A solider is already on this square, choose another square or remove this soldier before' );
        }

        //Verify if soldier has already been placed on board - Prevent a cheat / bug if player plays to fast...
        $sql = "SELECT soldier_id soldier_id FROM board WHERE soldier_id = $soldier_id";
        $soldier = self::getCollectionFromDb( $sql );
        if(count($soldier) != 0) {
            throw new BgaUserException ( 'This soldier has already been placed on board' );
        }

        //Update board
        self::DbQuery("UPDATE board SET board_player = $player_id, soldier_type = $type, soldier_id = $soldier_id WHERE (board_x = $x AND board_y = $y)");

        //Delete soldier from hand
        self::DbQuery("DELETE FROM soldier WHERE soldier_id = $soldier_id");

        $sql = "SELECT player_id player_id FROM player";
        $players = self::getCollectionFromDb( $sql );

        foreach($players as $database_player_id => $player) {
            if($database_player_id == $player_id)
                $typeTmp = $type;
            else
                $typeTmp = $this->UNKNOWN_SOLDIER;

            if($database_player_id == $SecondPlayerID)
                $yTmp = 11 - $y;
            else
                $yTmp = $y;

            self::notifyPlayer(
                $database_player_id,
                'placeSoldier', 
                clienttranslate(''), 
                array (
                    'x' => $x,
                    'y' => $yTmp,
                    'soldier_id' => $soldier_id,
                    'soldier_type' => $typeTmp,
                    'player_id' => $player_id,
                    'player_name' => $player_id //WRONG!!!!
                )
            );
        }

        //Verify number of soldier on players hand and move to next state
        $sql = "SELECT soldier_id soldier_id FROM soldier";
        $soldiersOnHand = self::getCollectionFromDb( $sql );
        if(count($soldiersOnHand) == 0) {
            $this->gamestate->nextState('initBoard');
        }
    }


    function moveSoldier($x, $y) {
        // self::checkAction("endTurnSpecialScoutAction");

        $player_id = self::getActivePlayerId();

        $SecondPlayerID = self::getGameStateValue( 'SecondPlayerID' );
        if($player_id == $SecondPlayerID) {   //If the player_id is the second in the list
            $y = 11 - $y;   //Invert positon on the board
        }

        //Identify which square has been selected
        $sql = "SELECT board_player player_id, soldier_type soldier_type, soldier_id soldier_id FROM board WHERE (board_x = $x AND board_y = $y)";
        $square = self::getCollectionFromDb( $sql );
        $squareKey = (int)array_keys($square)[0];

        self::dump( "squareKey = ", $squareKey);
        // self::dump('currentState = ', $this->gamestate->state()["name"]);

        $ChosenSoldierId = self::getGameStateValue( 'ChosenSoldierId' ) ;
        // if($ChosenSoldierId == $this->NO_SOLIDER) {  //If your are on selectSoldier State
        if($this->gamestate->state()["name"] == "selectSoldier") {
            if($squareKey != $player_id) {
                throw new BgaUserException ( 'This is not your soldier' );
            }
            else if($square[$player_id]['soldier_type'] == $this->BOMB) {
                throw new BgaUserException ( 'You cannot move a bomb' );
            }
            else if($square[$player_id]['soldier_type'] == $this->FLAG) {
                throw new BgaUserException ( 'You cannot move your flag' );
            }

            self::setGameStateValue( 'ChosenSoldierId', $square[$player_id]['soldier_id'] );   //Save selected soldier ID

            $this->gamestate->nextState("selectSoldier");
        }
        else { //If your are on moveSoldier State
            $sql = "SELECT board_player player_id, soldier_type soldier_type, board_x x, board_y y FROM board WHERE soldier_id = $ChosenSoldierId";
            $selectedSoldier = self::getCollectionFromDb( $sql );

            $ChosenSoldierX = $selectedSoldier[$player_id]['x'];
            $ChosenSoldierY = $selectedSoldier[$player_id]['y'];
            $ChosenSoldierType = $selectedSoldier[$player_id]['soldier_type'];

            if($squareKey == $player_id) {
                // throw new BgaUserException ( 'You cannot attack one of your soldier' );
                // self::debug( "Select one of my soldier" );
                // self::setGameStateValue( 'ChosenSoldierId', 0 );   //Reset ID value

                if($this->gamestate->state()["name"] == "moveSoldier") {
                    $this->gamestate->nextState("selectSoldier");

                    if($player_id == $SecondPlayerID) {   //If the player_id is the second in the list
                        $y = 11 - $y;   //Invert positon on the board
                    }

                    self::moveSoldier($x, $y);
                    // self::debug( "END Select one of my soldier" );
                    return;
                }
                else {
                    throw new BgaUserException ( 'You cannot attack one of your soldier' );  
                }
            }
            else if((abs($x - $ChosenSoldierX) >= 1 && abs($y - $ChosenSoldierY) >= 1)) {
                throw new BgaUserException ( 'You cannot move in diagonal' );
            }
            else if($this->gamestate->state()["name"] == "specialScoutAction") {
                if($square[$squareKey]['soldier_type'] == $this->EMPTY_SQUARE) {
                    throw new BgaUserException ( 'You can only attack but not move' );
                }
                else if((abs($x - $ChosenSoldierX) > 1 || abs($y - $ChosenSoldierY) > 1)) {
                    throw new BgaUserException ( 'You can only attack close from you' );
                }
            }
            else if( (abs($x - $ChosenSoldierX) > 1 || abs($y - $ChosenSoldierY) > 1) ) {
                if ($ChosenSoldierType != $this->SCOUT) {
                    throw new BgaUserException ( 'You cannot move more than one square at a time' );
                }
                else if(self::specialScoutMovement($x, $y, $ChosenSoldierX, $ChosenSoldierY)) {
                    throw new BgaUserException ( 'There is a soldier or a lake on the direction' );
                }
            }

            $sql = "SELECT player_id player_id FROM player";
            $players = self::getCollectionFromDb( $sql );

            if($square[$squareKey]['soldier_type'] == $this->BOMB && $squareKey != $player_id) {
                if($ChosenSoldierType != $this->MINER) {
                    $ChosenSoldierType = $square[$squareKey]['soldier_type'] - 1;   //Cheat to kill any soldier which attack the bomb
                }
            }
            else if($square[$squareKey]['soldier_type'] == $this->MARSHAL && $squareKey != $player_id) {
                if($ChosenSoldierType == $this->SPY) {
                    $ChosenSoldierType = $square[$squareKey]['soldier_type'] + 1;   //Cheat to kill the marshal
                }
            }
            else if($square[$squareKey]['soldier_type'] == $this->FLAG && $squareKey != $player_id) {   //End of the game
                // Update scores
                $sql = "UPDATE player SET player_score = player_score + 1 WHERE player_id = $player_id";
                self::DbQuery( $sql );

                $this->gamestate->nextState('endGame');
                return;
            }

            // Verify if you click on an opponent soldier, you will attack! and maybe die...
            if($ChosenSoldierType > $square[$squareKey]['soldier_type']) { //You attack a weaker opponent soldier (or selected an empty square)
                //Update board
                self::DbQuery("UPDATE board SET board_player = $player_id, soldier_type = $ChosenSoldierType, soldier_id = $ChosenSoldierId WHERE (board_x = $x AND board_y = $y)");
                self::DbQuery("UPDATE board SET board_player = $this->NO_PLAYER, soldier_type = $this->EMPTY_SQUARE, soldier_id = $this->NO_SOLIDER WHERE (board_x = $ChosenSoldierX AND board_y = $ChosenSoldierY)");

                if($square[$squareKey]['soldier_type'] == $this->EMPTY_SQUARE) { //If it is an empty square
                    $message = '${player_name} moves a soldier on board';
                    $notification = 'moveSoldierEmptySquare';
                }
                else {
                    $message = '${player_name} attack a weaker soldier!!';
                    $notification = 'attackWeakerSoldier';

                    // Update scores
                    $sql = "UPDATE player SET player_score = player_score + 1 WHERE player_id = $player_id";
                    self::DbQuery( $sql );

                    self::notifyPlayer(
                        $player_id,
                        'discoverOpponentSoldier', 
                        clienttranslate(''), 
                        array (
                            'soldier_id' => $square[$squareKey]['soldier_id'],
                            'soldier_type' => $square[$squareKey]['soldier_type']
                        )
                    );
                    self::notifyPlayer(
                        self::getOpponentID($player_id),
                        'discoverOpponentSoldier', 
                        clienttranslate(''), 
                        array (
                            'soldier_id' => $ChosenSoldierId,
                            'soldier_type' => $ChosenSoldierType
                        )
                    );
                }
        
                foreach($players as $database_player_id => $player) {
                    if($ChosenSoldierType == $this->SCOUT
                    && $player_id != $database_player_id
                    && $square[$squareKey]['soldier_type'] == $this->EMPTY_SQUARE) { //If you are not the active player, avoid sending info to not tell it is a scout! (because of special action)
                        continue;
                    }

                    if($database_player_id == $SecondPlayerID)
                        $yTmp = 11 - $y;
                    else
                        $yTmp = $y;
        
                    self::notifyPlayer(
                        $database_player_id,
                        $notification, 
                        clienttranslate($message), 
                        array (
                            'x' => $x,
                            'y' => $yTmp,
                            'soldier_id' => $ChosenSoldierId,
                            'opponent_soldier_id' => $square[$squareKey]['soldier_id'],
                            'player_id' => $player_id,
                            'player_name' => $player_id //WRONG!!!!
                        )
                    );

                    self::setGameStateValue( 'ScoutSpecialActionX', $x );   //Save value to be able to use it if active player click EndTurn Button
                    self::setGameStateValue( 'ScoutSpecialActionY', $y );   //Save value to be able to use it if active player click EndTurn Button
                }

                $newScores = self::getCollectionFromDb( "SELECT player_id, player_score FROM player", true );
                self::notifyAllPlayers( "newScores", "", array(
                    "scores" => $newScores
                ) );
            }
            else if($ChosenSoldierType == $square[$squareKey]['soldier_type']) { //If you have the same level than the the opponent soldier
                //Update board
                self::DbQuery("UPDATE board SET board_player = $this->NO_PLAYER, soldier_type = $this->EMPTY_SQUARE, soldier_id = $this->NO_SOLIDER WHERE (board_x = $x AND board_y = $y)");
                self::DbQuery("UPDATE board SET board_player = $this->NO_PLAYER, soldier_type = $this->EMPTY_SQUARE, soldier_id = $this->NO_SOLIDER WHERE (board_x = $ChosenSoldierX AND board_y = $ChosenSoldierY)");

                self::notifyPlayer(
                    $player_id,
                    'discoverOpponentSoldier', 
                    clienttranslate(''), 
                    array (
                        'soldier_id' => $square[$squareKey]['soldier_id'],
                        'soldier_type' => $square[$squareKey]['soldier_type']
                    )
                );
                self::notifyPlayer(
                    self::getOpponentID($player_id),
                    'discoverOpponentSoldier', 
                    clienttranslate(''), 
                    array (
                        'soldier_id' => $ChosenSoldierId,
                        'soldier_type' => $ChosenSoldierType
                    )
                );

                foreach($players as $database_player_id => $player) {
                    if($database_player_id == $SecondPlayerID)
                        $yTmp = 11 - $y;
                    else
                        $yTmp = $y;
        
                    self::notifyPlayer(
                        $database_player_id,
                        'attackSameSoldier', 
                        clienttranslate('${player_name} attack a soldier of the same level...'), 
                        array (
                            'x' => $x,
                            'y' => $yTmp,
                            'soldier_id' => $ChosenSoldierId,
                            'opponent_soldier_id' => $square[$squareKey]['soldier_id'],
                            'player_id' => $player_id,
                            'player_name' => $player_id //WRONG!!!!
                        )
                    );
                }
            }
            else {  //You attack a stronger soldier, you die...
                //Update board
                self::DbQuery("UPDATE board SET board_player = $this->NO_PLAYER, soldier_type = $this->EMPTY_SQUARE, soldier_id = $this->NO_SOLIDER WHERE (board_x = $ChosenSoldierX AND board_y = $ChosenSoldierY)");

                self::notifyPlayer(
                    $player_id,
                    'discoverOpponentSoldier', 
                    clienttranslate(''), 
                    array (
                        'soldier_id' => $square[$squareKey]['soldier_id'],
                        'soldier_type' => $square[$squareKey]['soldier_type']
                    )
                );
                self::notifyPlayer(
                    self::getOpponentID($player_id),
                    'discoverOpponentSoldier', 
                    clienttranslate(''), 
                    array (
                        'soldier_id' => $ChosenSoldierId,
                        'soldier_type' => $ChosenSoldierType
                    )
                );

                foreach($players as $database_player_id => $player) {
                    if($database_player_id == $SecondPlayerID)
                        $yTmp = 11 - $y;
                    else
                        $yTmp = $y;

                    if($database_player_id != $player_id) {
                        // Update scores
                        $sql = "UPDATE player SET player_score = player_score + 1 WHERE player_id = $database_player_id";
                        self::DbQuery( $sql );
                    }
        
                    self::notifyPlayer(
                        $database_player_id,
                        'attackStrongerSoldier', 
                        clienttranslate('${player_name} attacks a stronger soldier...'), 
                        array (
                            'x' => $x,
                            'y' => $yTmp,
                            'soldier_id' => $ChosenSoldierId,
                            'opponent_soldier_id' => $square[$squareKey]['soldier_id'],
                            'player_id' => $player_id,
                            'player_name' => $player_id //WRONG!!!!
                        )
                    );
                }

                $newScores = self::getCollectionFromDb( "SELECT player_id, player_score FROM player", true );
                self::notifyAllPlayers( "newScores", "", array(
                    "scores" => $newScores
                ) );
            }

            if($ChosenSoldierType == $this->SCOUT 
            && $this->gamestate->state()["name"] == "moveSoldier"
            && $square[$squareKey]['soldier_type'] == $this->EMPTY_SQUARE)
                $this->gamestate->nextState("specialScoutAction");
            else {
                self::setGameStateValue( 'ChosenSoldierId', 0 );   //Reset ID value
                $this->gamestate->nextState('moveSoldier');
            }
        }
    }

    
//////////////////////////////////////////////////////////////////////////////
//////////// Game state arguments
////////////

    /*
        Here, you can create methods defined as "game state arguments" (see "args" property in states.inc.php).
        These methods function is to return some additional information that is specific to the current
        game state.
    */

    /*
    
    Example for game state "MyGameState":
    
    function argMyGameState()
    {
        // Get some values from the current game situation in database...
    
        // return values:
        return array(
            'variable1' => $value1,
            'variable2' => $value2,
            ...
        );
    }    
    */

//////////////////////////////////////////////////////////////////////////////
//////////// Game state actions
////////////

    /*
        Here, you can create methods defined as "game state actions" (see "action" property in states.inc.php).
        The action method of state X is called everytime the current game state is set to X.
    */
    
    function stNextPlayer() {
        $player_id = self::activeNextPlayer();
        self::giveExtraTime($player_id);
        $this->gamestate->nextState('nextPlayer');
    }

//////////////////////////////////////////////////////////////////////////////
//////////// Zombie
////////////

    /*
        zombieTurn:
        
        This method is called each time it is the turn of a player who has quit the game (= "zombie" player).
        You can do whatever you want in order to make sure the turn of this player ends appropriately
        (ex: pass).
        
        Important: your zombie code will be called when the player leaves the game. This action is triggered
        from the main site and propagated to the gameserver from a server, not from a browser.
        As a consequence, there is no current player associated to this action. In your zombieTurn function,
        you must _never_ use getCurrentPlayerId() or getCurrentPlayerName(), otherwise it will fail with a "Not logged" error message. 
    */

    function zombieTurn( $state, $active_player )
    {
    	$statename = $state['name'];
    	
        if ($state['type'] === "activeplayer") {
            switch ($statename) {
                default:
                    $this->gamestate->nextState( "zombiePass" );
                	break;
            }

            return;
        }

        if ($state['type'] === "multipleactiveplayer") {
            // Make sure player is in a non blocking status for role turn
            $this->gamestate->setPlayerNonMultiactive( $active_player, '' );
            
            return;
        }

        throw new feException( "Zombie mode not supported at this game state: ".$statename );
    }
    
///////////////////////////////////////////////////////////////////////////////////:
////////// DB upgrade
//////////

    /*
        upgradeTableDb:
        
        You don't have to care about this until your game has been published on BGA.
        Once your game is on BGA, this method is called everytime the system detects a game running with your old
        Database scheme.
        In this case, if you change your Database scheme, you just have to apply the needed changes in order to
        update the game database and allow the game to continue to run with your new version.
    
    */
    
    function upgradeTableDb( $from_version )
    {
        // $from_version is the current version of this game database, in numerical form.
        // For example, if the game was running with a release of your game named "140430-1345",
        // $from_version is equal to 1404301345
        
        // Example:
//        if( $from_version <= 1404301345 )
//        {
//            // ! important ! Use DBPREFIX_<table_name> for all tables
//
//            $sql = "ALTER TABLE DBPREFIX_xxxxxxx ....";
//            self::applyDbUpgradeToAllDB( $sql );
//        }
//        if( $from_version <= 1405061421 )
//        {
//            // ! important ! Use DBPREFIX_<table_name> for all tables
//
//            $sql = "CREATE TABLE DBPREFIX_xxxxxxx ....";
//            self::applyDbUpgradeToAllDB( $sql );
//        }
//        // Please add your future database scheme changes here
//
//


    }    
}
