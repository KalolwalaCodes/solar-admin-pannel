import * as React from 'react';
import { Card, CardContent, Typography, Button } from '@mui/joy';
import { CardMedia } from '@mui/material';
import  DeleteIcon  from '@mui/icons-material/Delete';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';

const NewsCard = ({ news }) => {
    const takeMeToArticle=(link)=>{
     window.open(link,'_blank');
    }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
      {news&&news.length>0&&news.map((item) => (
        <Card key={item.id} variant="outlined" sx={{ maxWidth: 345 ,pt:'40px'}}>
          <CardMedia
            component="img"
            height="140"
            image={item.thumbnail}
            alt={item.headline}
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              {item.headline}
            </Typography>
            {/* <Typography variant="body2" color="text.secondary">
              {item.shortNews}
            </Typography> */}
            <Typography variant="caption" display="block" gutterBottom>
              {item.date}
            </Typography>
            <Button
              variant="plain"
              color="primary"
              onClick={()=>takeMeToArticle(item?.link)}
              rel="noopener noreferrer"
            >
              Read more<KeyboardArrowRight/>
            </Button>
            <div className='absolute bottom-[4px] right-[10px]'>
            <Button className='w-[30px] rounded-lg'><DeleteIcon/></Button>

            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default NewsCard;
