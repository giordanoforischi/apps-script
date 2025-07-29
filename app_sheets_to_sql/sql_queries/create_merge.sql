DELIMITER $$

CREATE PROCEDURE `main`.`merge_data`()
BEGIN
	UPDATE temp 
	SET `index` = 0 
	WHERE TRUE;

	INSERT INTO main.sheets_data
	
	SELECT * FROM main.temp 
	
	ON DUPLICATE KEY UPDATE sheets.name = temp.name,
        sheets.value = temp.value,
        sheets.date = temp.date,
        sheets.index = temp.index;
	
	DROP TABLE main.temp;

END

DELIMITER ;