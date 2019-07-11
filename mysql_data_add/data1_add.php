<?php
/**
 * Created by PhpStorm.
 * User: zw
 * Date: 2019/7/11
 * Time: 16:42
 */

function readObj($filename)
{
    $file = fopen($filename, "r");

    $n = 0;

    // 实例化PDO
    $pdo = connectDB();

    while (!feof($file)) {
        $line = mb_substr(fgets($file), 1);

        $fromQQPos = mb_strpos($line, '(');
        if ($fromQQPos !== false) {
            $fromNickname = mb_substr($line, 0, $fromQQPos);
            $fromQQNumber = mb_substr($line, $fromQQPos + 1, mb_strpos($line, ')') - $fromQQPos - 1);

            $toNickname = '';
            $toQQNumber = '';
            $content = mb_substr($line, mb_strpos($line, '：') + 1, -2);

            if ($content != 'javascript:void(0)') {
                $n++;

                $toNicknamePos = mb_strpos($line, '@');
                if ($toNicknamePos !== false) {
                    $buffer = mb_substr($line, $toNicknamePos + 1);
                    $toQQPos = mb_strpos($buffer, '(');
                    $toNickname = mb_substr($buffer, 0, $toQQPos);
                    $toQQNumber = mb_substr($buffer, $toQQPos + 1, mb_strpos($buffer, ')') - $toQQPos - 1);
                }

                // 输出解析后的数据
                //echo $n . ' ' . $fromNickname . ' ' . $fromQQNumber . ' ' . $toNickname . ' ' . $toQQNumber . ' ' . $content . "\n";

                // 写入mysql数据库
                $sql = "INSERT INTO qq_music (id, type, from_nickname, from_qq_number, to_nickname, to_qq_number, content) VALUES (:id, :type, :from_nickname, :from_qq_number, :to_nickname, :to_qq_number, :content)";
                $stmt = $pdo->prepare($sql);
                $res = $stmt->execute(['id' => $n, 'type' => 'D0', 'from_nickname' => $fromNickname, 'from_qq_number' => $fromQQNumber, 'to_nickname' => $toNickname, 'to_qq_number' => $toQQNumber, 'content' => $content]);

                if ($res) {
                    echo $n . " Yes\n";
                } else {
                    echo $n . " No\n";
                }
            }
        }
    }

    fclose($file);
}

$from = time();
readObj('data1.txt');
echo time() - $from;

function connectDB()
{
    try {
        $PDO = new PDO("mysql:host=127.0.0.1;dbname=lifanko", "root", "lifanko521");
    } catch (PDOException $e) {
        die('Fail');
    }
    $PDO->query("set names utf8");

    return $PDO;
}