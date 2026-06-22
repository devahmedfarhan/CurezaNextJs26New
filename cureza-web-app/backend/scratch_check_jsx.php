<?php

$filePath = 'd:/Cureza/cureza-web-app/frontend/src/app/seller/dashboard/orders/[id]/page.tsx';
$content = file_get_contents($filePath);

$len = strlen($content);
$braces = 0;
$parens = 0;
$inString = false;
$stringChar = '';
$inComment = false;
$line = 1;
$col = 1;

$braceStack = [];
$parenStack = [];

for ($i = 0; $i < $len; $i++) {
    $char = $content[$i];
    
    if ($char === "\n") {
        $line++;
        $col = 1;
        if ($inComment === 'single') {
            $inComment = false;
        }
        continue;
    }
    
    $col++;
    
    // Handle comments
    if ($inComment === 'multi') {
        if ($char === '*' && isset($content[$i+1]) && $content[$i+1] === '/') {
            $inComment = false;
            $i++;
        }
        continue;
    }
    
    if (!$inString && !$inComment) {
        if ($char === '/' && isset($content[$i+1]) && $content[$i+1] === '/') {
            $inComment = 'single';
            $i++;
            continue;
        }
        if ($char === '/' && isset($content[$i+1]) && $content[$i+1] === '*') {
            $inComment = 'multi';
            $i++;
            continue;
        }
    }
    
    // Handle strings
    if ($inString) {
        if ($char === '\\') {
            $i++; // skip escaped char
            continue;
        }
        if ($char === $stringChar) {
            $inString = false;
        }
        continue;
    }
    
    if ($char === '"' || $char === "'" || $char === '`') {
        $inString = true;
        $stringChar = $char;
        continue;
    }
    
    // Track brackets
    if ($char === '{') {
        $braces++;
        $braceStack[] = ['line' => $line, 'col' => $col, 'type' => '{'];
    } elseif ($char === '}') {
        $braces--;
        if (empty($braceStack)) {
            echo "ERROR: Extra '}' at line $line, col $col\n";
        } else {
            array_pop($braceStack);
        }
    } elseif ($char === '(') {
        $parens++;
        $parenStack[] = ['line' => $line, 'col' => $col, 'type' => '('];
    } elseif ($char === ')') {
        $parens--;
        if (empty($parenStack)) {
            echo "ERROR: Extra ')' at line $line, col $col\n";
        } else {
            array_pop($parenStack);
        }
    }
}

echo "Final Braces Balance: $braces\n";
echo "Final Parentheses Balance: $parens\n";

if (!empty($parenStack)) {
    echo "\nUnclosed '(' list:\n";
    foreach ($parenStack as $p) {
        echo " - Line {$p['line']}, col {$p['col']}\n";
    }
}
