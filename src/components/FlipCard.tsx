import {Inter} from 'next/font/google'
import {Box, Paper, Typography} from "@mui/material";
import {useEffect, useState} from "react";
import ReactCardFlip from "react-card-flip";


const inter = Inter({subsets: ['latin']})

const images = [
    "painting1-113646-Tabriz-Iran.png",
    "painting1-1264733-Lucknow-India.png",
    "painting1-1278710-Amritsar-India.png",
    "painting1-1790630-Xi’an-China.png",
    "painting1-1799962-Nanjing-China.png",
    "painting1-1809858-Guangzhou-China.png",
    "painting1-1857910-Kyoto-Japan.png",
    "painting1-276781-Beirut-Lebanon.png",
    "painting1-2803138-Antwerpen-Belgium.png",
    "painting1-281184-Jerusalem-Israel.png",
    "painting1-3181928-Bologna-Italy.png",
    "painting1-359796-Suez-Egypt.png",
    "painting1-360995-Giza-Egypt.png",
    "painting1-4140963-Washington-United_States.png",
    "painting1-520555-Nizhniy_Novgorod-Russia.png",
    "painting1-611717-Tbilisi-Georgia.png",
    "painting1-6167865-Toronto-Canada.png",
    "painting1-6325494-Québec_City-Canada.png",
    "painting1-71137-Sanaa-Yemen.png"
]

const text = [
    // blogs
    "Mogadishu, Somalia is a city that is steeped in history and culture. Located on the Horn of Africa, it has been an important center of trade for centuries. The city has seen its share of troubles, including war and violence, but in recent years, it has made strides towards stability and rebuilding. Despite the challenges, Mogadishu is a city that is rich in tradition, character, and beauty.",
    "Sanaa, the capital of Yemen, is a city full of history and architecture that will leave you breathless. As you walk through the old city, you'll feel as if you're transported back in time with its unique traditional architecture and ancient streets. ",
    "One of the top attractions in Dar es Salaam is the National Museum of Tanzania. This museum houses a vast collection of artifacts that tell the story of Tanzania's history and culture. Here, you can learn about everything from the origins of early humans to the struggles and triumphs of the country's modern era.",
    "As I walked through the bustling streets of Konya, Turkey, I couldn't help but feel captivated by the city's rich cultural heritage. Konya is known for its deep connections to the Muslim world, and the city is home to the dazzling Mevlana Museum, a tribute to the founder of the Sufi sect of Islam.",

    // descriptions
    "Athens, Greece is a historic city known for its ancient ruins and iconic landmarks, such as the Acropolis and the Parthenon temple. It is the capital and largest city in Greece, located in the southern region of Attica. Athens is a bustling metropolis with a population of over 3 million people, making it one of the largest cities in Europe.",
    "Tbilisi is the vibrant capital city of Georgia, situated in the picturesque valleys of the Caucasus Mountains. With a rich history stretching back to the 5th century, Tbilisi is a fascinating blend of old-world charm and modern sophistication. The city boasts a unique mix of architectural styles, from medieval fortress walls to ornate Art Nouveau buildings and art-filled museums.",
    "Lviv is a city in western Ukraine, rich in history and culture. It is known for its stunning architecture, ranging from Gothic churches to Renaissance and Baroque buildings. The city has a central old town area that includes cobblestone streets and colorful buildings. Lviv is also known for its coffee culture and chocolate shops, and has a lively nightlife scene with cafes, restaurants, and bars.",

    // haiku
    "Ancient city of Erbil,\n" + "Faces of history,\n" + "Eternal stories.",
    "Ancient city stands,\n" + "Lahore in emerald green,\n" + "History alive.",
    "City of leather,\n" + "Tanneries by the riverbank,\n" + "Kanpur's heartbeat strong.",
    "Motorbikes speed by\n" + "The smell of pho fills the air\n" + "Ho Chi Minh City",
    "Alpine breeze blowing\n" + "Lakeshore city, Zürich shines\n" + "Swiss heartland beckons",
    "Orange sun sets low\n" + "Sipping mint tea in the souk\n" + "Marrakesh's warm glow",

    // food
    "One of the most popular local dishes in Minsk, Belarus is draniki, also known as potato pancakes. These savory pancakes are made from grated potatoes mixed with flour, eggs, and onions, and fried until crispy and golden brown. Draniki are often served hot with a dollop of sour cream or apple sauce on top for delicious contrast.",
    "Cuttack is a historical city in the eastern Indian state of Odisha. The city boasts a rich culture, and one of its most famous attractions is its unique cuisine. One of the most popular local foods in Cuttack is Dahibara Aloodum.",
    "One of the most popular local foods in Rabat, Morocco is the traditional dish called tagine. This dish is made from slow-cooked meat (usually chicken, lamb, or beef) which is simmered in a flavorful saucy broth with a blend of spices that give it a uniquely Moroccan flavor. The dish is then served in a earthenware pot called a “tagine” – hence the name.",

    // poem
    "In Erbil, the city of old,  \n" +
    "The story of history is told.  \n" +
    "A place of beauty, culture, and art  \n" +
    "A land that's close to many a heart.",

    "In Kyoto's ancient streets,\n" +
    "A city rich in culture meets,\n" +
    "Temples and gardens to explore,\n" +
    "A history to adore.\n",

    "Melbourne, oh Melbourne  \n" +
    "City of endless charm  \n" +
    "With skyline high and laneways wide  \n" +
    "You're every tourist's farm",

    "Golden bridge spans the bay,\n" +
    "Fog creeping in day by day,\n" +
    "Cable cars and ocean breeze,\n" +
    "San Francisco, city of dreams",

    "Rasht, my heart beats for thee,\n" +
    "Your lush greenery is a sight to see.\n" +
    "From Sefidrud to Talesh hills,\n" +
    "Your beauty fills me with thrills.",

    "Nairobi, city of the sun,\n" +
    "Buzzing with life, always on the run.\n" +
    "From the Maasai Mara to the streets below,\n" +
    "The heartbeat of Kenya, it does bestow.",

    "Kampala, city of hills and green,\n" +
    "Where vibrant life is always seen.\n" +
    "From bustling markets to friendly smiles,\n" +
    "The energy here always beguiles.",

    "Jakarta, teeming city of life  \n" +
    "A place where cultures blend and thrive  \n" +
    "Mega malls and street food stalls  \n" +
    "Modern skyscrapers, art on walls",

    // song
    "Suez, oh Suez, a city on the Nile,\n" +
    "Where ships sail through the canal with style,\n" +
    "From the Red Sea to the Mediterranean,\n" +
    "A hub of trade and commerce, oh so grand.",

    // fun facts
    "Benghazi is known for its unique spinach pie called \"Bazin Bil Awarma.\" It is a traditional dish made with spinach, onions, olive oil, and spices, served with a side of beef or lamb soup.",
    "Jerusalem has over 2,000 public parks and gardens, making it one of the greenest cities in the world.",
    "İzmir is home to the world's oldest continuously inhabited urban center, dating back to around 3000 BC.",
    "The Great Pyramid of Giza is the only remaining Wonder of the Ancient World!",
    "Alexandria was once home to the world's largest library, which held an estimated 500,000 to 700,000 books and manuscripts until it was destroyed in a fire in the 3rd century AD.",
    "Kabul has one of the highest elevations of any capital city in the world, sitting at an altitude of over 6,000 feet above sea level.",
    "Johannesburg has the tallest building in Africa, the Carlton Centre, which stands at 223 meters high.",
    "Hyderabad is one of the few cities in India where one can find “Irani Cafes,” which are not found anywhere else in the country. These cafes serve popular items such as Irani chai (tea), Osmania biscuits, and bun maska (bread and butter).",
    "Xi'an is home to the world's largest man-made forest, the Yan'an Forest Park, which covers an area of 78,000 acres and features over 3 million trees.",
    "Wuhan is the birthplace of hot and dry noodles, a popular street food dish in China that is made by mixing wheat flour and water, then pulling the dough into long thin strips, boiling them, and rinsing them in cold water."

]

function getRandomContent(): Array<any> {
    if (Math.random() > 0.3) {
        let randomNum = Math.floor(Math.random() * text.length)
        let randomContent = text[randomNum]
        return [randomContent.split("\n").map((item) => {
            return <Typography key={item}>{item}</Typography>
        })]
    } else {
        const link = window.location.origin +"/promo_images/" + images[Math.floor(Math.random() * images.length)]
        return [<img key="img" height="100%" width="100%"
                     alt={link}
                     src={link}
        />]
    }
}

export default function FlipCard() {
    // flip state list of four cards
    const [isFlipped, setIsFlipped] = useState(false)
    // array of objects for card front and back states
    const [cardState, setCardState] = useState({front: getRandomContent(), back: getRandomContent()},
    )

    useEffect(() => {
        const interval = setInterval(() => {
            // set the card state
            if (isFlipped) {
                setCardState({front: getRandomContent(), back: cardState.back})
            } else {
                setCardState({front: cardState.front, back: getRandomContent()})
            }
            // execute after 1 second
            setTimeout(() => {
                setIsFlipped(!isFlipped)
            }, 1000)


        }, Math.random() * 10000);

        return () => clearInterval(interval);
    }, [isFlipped]);


    return (
        <Box sx={{margin: "2vh"}}>
            <ReactCardFlip
                isFlipped={isFlipped} flipDirection="vertical"
            >
                <Paper sx={{padding: "1vh", width: "30vh", height: "30vh", overflow: 'hidden',}}>
                    {...cardState.front}
                </Paper>
                <Paper sx={{padding: "1vh", width: "30vh", height: "30vh", overflow: 'hidden',}}>
                    {...cardState.back}
                </Paper>
            </ReactCardFlip>
        </Box>
    )
}