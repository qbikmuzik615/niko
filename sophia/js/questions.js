// Sophia's Math Quest – question banks (going into 3rd grade)
// Loaded as a classic script; sets window.STAGES used by app.js module

const STAGES = [
  {
    id:1, emoji:'🚀', name:'Addition Adventure', desc:'Stack it up & blast off!',
    questions:[
      {q:'What is 7 + 6?', choices:['11','13','12','14'], answer:'13'},
      {q:'What is 8 + 9?', choices:['16','18','17','15'], answer:'17'},
      {q:'What is 34 + 8?', choices:['41','42','43','44'], answer:'42', stack:['  34','+   8','----']},
      {q:'What is 57 + 6?', choices:['62','63','64','61'], answer:'63', stack:['  57','+   6','----']},
      {q:'What is 45 + 9?', choices:['53','54','55','52'], answer:'54', stack:['  45','+   9','----']},
      {q:'What is 23 + 14?', choices:['36','37','38','35'], answer:'37', stack:['  23','+ 14','----']},
      {q:'What is 27 + 38?', choices:['64','65','66','63'], answer:'65', stack:['  27','+ 38','----'], hint:'Ones: 7+8=15, write 5 carry 1. Tens: 2+3+1=6.'},
      {q:'What is 46 + 57?', choices:['102','103','101','104'], answer:'103', stack:['  46','+ 57','----']},
      {q:'What is 124 + 253?', choices:['376','377','378','375'], answer:'377', stack:['  124','+ 253','-----']},
      {q:'What is 365 + 248?', choices:['612','613','614','611'], answer:'613', stack:['  365','+ 248','-----']},
      {q:'Sophia has 28 stickers. She gets 37 more. How many stickers now?', choices:['64','65','66','63'], answer:'65', hint:'Stack 28 + 37. Ones: 8+7=15, write 5 carry 1. Tens: 2+3+1=6.'},
      {q:'145 stars in one galaxy, 238 in another. How many total?', choices:['382','383','384','381'], answer:'383'},
      {q:'A train has 49 passengers. 35 more get on. How many now?', choices:['83','84','85','82'], answer:'84'},
      {q:'Fill in the blank: 15, 22, 29, ___, 43', choices:['35','36','37','34'], answer:'36', hint:'What is being added each time?'},
      {q:'What is 58 + 74?', choices:['130','132','131','133'], answer:'132', stack:['  58','+ 74','----']},
    ]
  },
  {
    id:2, emoji:'🦁', name:'Subtraction Safari', desc:'Borrow through the jungle!',
    questions:[
      {q:'What is 87 - 34?', choices:['52','53','54','51'], answer:'53', stack:['  87','- 34','----']},
      {q:'What is 96 - 42?', choices:['53','54','55','52'], answer:'54', stack:['  96','- 42','----']},
      {q:'What is 52 - 28?', choices:['23','24','25','22'], answer:'24', stack:['  52','- 28','----'], hint:'Can\'t do 2-8! Borrow from the tens. 52 → 4 tens and 12 ones. 12-8=4, 4-2=2.'},
      {q:'What is 83 - 47?', choices:['35','36','37','34'], answer:'36', stack:['  83','- 47','----'], hint:'Borrow from 8 tens: 13-7=6 ones, 7-4=3 tens.'},
      {q:'What is 71 - 36?', choices:['34','35','36','33'], answer:'35', stack:['  71','- 36','----']},
      {q:'What is 60 - 24?', choices:['35','36','37','34'], answer:'36', stack:['  60','- 24','----'], hint:'Borrow to get 5 tens and 10 ones. 10-4=6, 5-2=3.'},
      {q:'What is 145 - 78?', choices:['66','67','68','65'], answer:'67', stack:['  145','- 078','-----']},
      {q:'What is 302 - 165?', choices:['136','137','138','135'], answer:'137', stack:['  302','- 165','-----'], hint:'Borrow across the zero!'},
      {q:'Sophia had 82 gummy bears. She ate 37. How many left?', choices:['44','45','46','43'], answer:'45', hint:'82-37: borrow from the 8.'},
      {q:'A tree is 124 cm tall. It was 87 cm last year. How much did it grow?', choices:['36','37','38','35'], answer:'37'},
      {q:'200 people at a concert. 143 went home. How many stayed?', choices:['56','57','58','55'], answer:'57', hint:'200-143. Borrow across zeros!'},
      {q:'A store had 93 apples, sold 48. How many left?', choices:['44','45','46','43'], answer:'45'},
      {q:'What is 100 - 38?', choices:['61','62','63','60'], answer:'62', hint:'What do you add to 38 to get 100?'},
      {q:'Maria has 54 crayons. She gives 19 away. How many does she keep?', choices:['34','35','36','33'], answer:'35'},
      {q:'What is 500 - 275?', choices:['224','225','226','223'], answer:'225'},
    ]
  },
  {
    id:3, emoji:'🔮', name:'Word Wizard', desc:'Solve the math mysteries!',
    questions:[
      {q:'I am a number between 20 and 30. My digits add up to 8. What am I?', choices:['26','28','24','27'], answer:'26', hint:'List 20-29 and check which digits sum to 8.'},
      {q:'I am even, between 40 and 50. Subtract 6 and you get 38. What am I?', choices:['42','44','46','48'], answer:'44'},
      {q:'A bag has 35 marbles. 18 are red. How many are blue?', choices:['16','17','18','15'], answer:'17'},
      {q:'Sam reads 12 pages Monday, 15 Tuesday, 9 Wednesday. Total pages?', choices:['35','36','37','34'], answer:'36'},
      {q:'A wizard has 4 shelves of spell books, 8 books each. Total books?', choices:['30','32','34','28'], answer:'32', hint:'4 groups of 8.'},
      {q:'Sophia has 12 white, 9 black, and 14 sparkly rocks. Total?', choices:['34','35','36','33'], answer:'35'},
      {q:'Number pattern: 3, 7, 11, 15, ___. What is the rule?', choices:['Add 3','Add 4','Add 5','Add 2'], answer:'Add 4', hint:'Subtract each number from the next.'},
      {q:'Tom has 3 times as many marbles as Lisa. Lisa has 8. How many does Tom have?', choices:['21','24','27','18'], answer:'24'},
      {q:'A school bus has 48 seats. 29 are taken. How many empty seats?', choices:['18','19','20','17'], answer:'19'},
      {q:'What number makes this true? ___ + 29 = 63', choices:['33','34','35','32'], answer:'34', hint:'63 - 29 = ?'},
      {q:'Sophia has $48. She earns $15 more and spends $27. How much now?', choices:['$35','$36','$37','$34'], answer:'$36', hint:'$48 + $15 = $63. $63 - $27 = ?'},
      {q:'Which number sentence is TRUE?', choices:['6+9=14','8×3=22','7×4=28','5+16=22'], answer:'7×4=28'},
      {q:'A robot walks 5 forward, 3 back, 6 forward. Where does it end up?', choices:['7 forward','8 forward','9 forward','6 forward'], answer:'8 forward', hint:'5 - 3 + 6 = ?'},
      {q:'24 cookies, eat 3, share the rest equally among 7 friends. How many per friend?', choices:['2','3','4','5'], answer:'3', hint:'24 - 3 = 21. Then 21 ÷ 7 = ?'},
      {q:'A garden has 7 rows with 6 flowers each. How many flowers total?', choices:['40','42','44','38'], answer:'42'},
    ]
  },
  {
    id:4, emoji:'🏰', name:'Times Table Tower', desc:'Climb the multiplication castle!',
    questions:[
      {q:'What is 3 × 4?', choices:['10','11','12','13'], answer:'12'},
      {q:'What is 6 × 7?', choices:['40','41','42','43'], answer:'42'},
      {q:'What is 8 × 9?', choices:['71','72','73','74'], answer:'72'},
      {q:'What is 5 × 8?', choices:['38','39','40','41'], answer:'40'},
      {q:'What is 7 × 7?', choices:['46','47','48','49'], answer:'49'},
      {q:'What is 4 × 9?', choices:['34','35','36','37'], answer:'36'},
      {q:'What is 6 × 8?', choices:['46','47','48','49'], answer:'48'},
      {q:'What is 9 × 9?', choices:['79','80','81','82'], answer:'81'},
      {q:'What is 7 × 8?', choices:['54','55','56','57'], answer:'56'},
      {q:'A carton holds 6 eggs. How many eggs in 9 cartons?', choices:['52','53','54','55'], answer:'54', hint:'9 × 6'},
      {q:'A spider has 8 legs. How many legs do 7 spiders have?', choices:['54','55','56','57'], answer:'56'},
      {q:'What is 12 × 4?', choices:['46','47','48','49'], answer:'48', hint:'10×4=40 and 2×4=8, then add!'},
      {q:'What is 11 × 6?', choices:['64','65','66','67'], answer:'66', hint:'10×6=60 plus 1×6=6'},
      {q:'8 boxes, each with 12 crayons. How many crayons total?', choices:['94','95','96','97'], answer:'96', hint:'8 × 12 = 8×10 + 8×2'},
      {q:'What is 3 × 3 × 3?', choices:['25','27','29','21'], answer:'27', hint:'First 3×3=9, then 9×3=?'},
    ]
  },
  {
    id:5, emoji:'🌊', name:'Division Discovery', desc:'Share & explore the deep blue!',
    questions:[
      {q:'8 fish shared equally in 2 bowls. How many per bowl?', choices:['2','3','4','5'], answer:'4', hint:'Think: 2 × ? = 8'},
      {q:'12 apples shared among 3 kids. How many each?', choices:['3','4','5','6'], answer:'4', hint:'3 × ? = 12'},
      {q:'15 stickers shared among 5 friends. How many each?', choices:['2','3','4','5'], answer:'3', hint:'5 × ? = 15'},
      {q:'20 cookies shared equally among 4 friends. How many each?', choices:['4','5','6','7'], answer:'5'},
      {q:'What is 18 ÷ 3?', choices:['4','5','6','7'], answer:'6', hint:'3 × ? = 18'},
      {q:'What is 24 ÷ 4?', choices:['5','6','7','8'], answer:'6', hint:'4 × ? = 24'},
      {q:'What is 35 ÷ 5?', choices:['5','6','7','8'], answer:'7', hint:'5 × ? = 35'},
      {q:'What is 42 ÷ 7?', choices:['5','6','7','8'], answer:'6', hint:'7 × ? = 42'},
      {q:'What is 56 ÷ 8?', choices:['5','6','7','8'], answer:'7', hint:'8 × ? = 56'},
      {q:'What is 81 ÷ 9?', choices:['7','8','9','10'], answer:'9', hint:'9 × ? = 81'},
      {q:'48 crayons split into 8 equal boxes. How many per box?', choices:['5','6','7','8'], answer:'6'},
      {q:'A baker makes 45 muffins, puts 9 in each bag. How many bags?', choices:['4','5','6','7'], answer:'5', hint:'45 ÷ 9 = ?'},
      {q:'If 7 × 8 = 56, then 56 ÷ 7 = ___', choices:['6','7','8','9'], answer:'8', hint:'Division and multiplication are opposites!'},
      {q:'If 9 × 6 = 54, then 54 ÷ 6 = ___', choices:['7','8','9','10'], answer:'9'},
      {q:'72 students split into groups of 8. How many groups?', choices:['7','8','9','10'], answer:'9'},
    ]
  },
  {
    id:6, emoji:'🔬', name:'Science Lab', desc:'Math meets science!',
    questions:[
      {q:'A caterpillar is 4 cm. A butterfly is 11 cm. How much longer is the butterfly?', choices:['6 cm','7 cm','8 cm','9 cm'], answer:'7 cm'},
      {q:'A scientist adds 175 mL to 250 mL. How much water is there now?', choices:['424 mL','425 mL','426 mL','423 mL'], answer:'425 mL'},
      {q:'A plant grows 3 cm every week. Starting at 5 cm, how tall after 7 weeks?', choices:['25 cm','26 cm','27 cm','28 cm'], answer:'26 cm', hint:'5 + (3 × 7) = ?'},
      {q:'60 seconds in a minute. How many seconds in 4 minutes?', choices:['220','230','240','250'], answer:'240', hint:'60 × 4'},
      {q:'A bee visits 6 flowers per minute. How many in 9 minutes?', choices:['52','53','54','55'], answer:'54'},
      {q:'A tree has 5 branches, each with 8 leaves. Total leaves?', choices:['38','40','42','44'], answer:'40'},
      {q:'A frog jumps 45 cm each leap. How far in 6 leaps?', choices:['268','269','270','271'], answer:'270', hint:'45 × 6'},
      {q:'A pizza cut into 8 equal slices. Sophia eats 3. What fraction did she eat?', choices:['2/8','3/8','4/8','5/8'], answer:'3/8'},
      {q:'Which is bigger: 1/2 or 1/4?', choices:['1/4','They are equal','1/2','Cannot compare'], answer:'1/2', hint:'More pieces = smaller pieces!'},
      {q:'A ribbon is 12 cm. Cut off 1/4 of it. How many cm cut?', choices:['2 cm','3 cm','4 cm','5 cm'], answer:'3 cm', hint:'12 ÷ 4 = ?'},
      {q:'5 students counted butterflies: 4, 7, 3, 9, 2. What is the total?', choices:['23','24','25','26'], answer:'25'},
      {q:'14 kids like cats, 22 like dogs, 8 like fish. How many kids total?', choices:['43','44','45','46'], answer:'44'},
      {q:'A human heart beats ~70 times a minute. About how many times in 1 hour?', choices:['3,200','4,200','4,800','5,200'], answer:'4,200', hint:'70 × 60 minutes'},
      {q:'A cheetah runs 112 km in 2 hours. How far per hour?', choices:['54','55','56','57'], answer:'56', hint:'112 ÷ 2'},
      {q:'A water tank is 3/4 full. It holds 40 litres when full. How many litres in it?', choices:['28','29','30','31'], answer:'30', hint:'40 ÷ 4 × 3'},
    ]
  }
];

window.STAGES = STAGES;
