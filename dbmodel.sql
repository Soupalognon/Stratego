
-- ------
-- BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
-- StrategoSoupalognon implementation : © Gabriel Durand <gabriel.durand@hotmail.fr>
-- 
-- This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
-- See http://en.boardgamearena.com/#!doc/Studio for more information.
-- -----

CREATE TABLE IF NOT EXISTS `board` (
  `board_x` smallint(5) unsigned NOT NULL,
  `board_y` smallint(5) unsigned NOT NULL,
  `board_player` int(10) unsigned DEFAULT 0,
  `soldier_type` smallint(5) DEFAULT -1,
  `soldier_id` int(10) DEFAULT 0,
  PRIMARY KEY (`board_x`,`board_y`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `soldier` (
  `soldier_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `soldier_type` smallint(5) unsigned NOT NULL,
  `soldier_name` varchar(16),
  `player_id` int(11) NOT NULL,
  PRIMARY KEY (`soldier_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1;

CREATE TABLE IF NOT EXISTS `soldiercounter` (
  `player_id` int(11) NOT NULL,
  `counter0` smallint(5) unsigned DEFAULT 1,
  `counter1` smallint(5) unsigned DEFAULT 6,
  `counter2` smallint(5) unsigned DEFAULT 1,
  `counter3` smallint(5) unsigned DEFAULT 8,
  `counter4` smallint(5) unsigned DEFAULT 5,
  `counter5` smallint(5) unsigned DEFAULT 4,
  `counter6` smallint(5) unsigned DEFAULT 4,
  `counter7` smallint(5) unsigned DEFAULT 4,
  `counter8` smallint(5) unsigned DEFAULT 3,
  `counter9` smallint(5) unsigned DEFAULT 2,
  `counter10` smallint(5) unsigned DEFAULT 1,
  `counter11` smallint(5) unsigned DEFAULT 1,
  PRIMARY KEY (`player_id`)
) ENGINE=InnoDB;