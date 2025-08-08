// // src/app/core/models/article.model.ts

// export interface Article {
//   _id: string;
//   title: string;
//   content: string;
//   image: string;
//   tags: string[];
//   createdAt: string;
//   authorDetails?: {
//     username: string;
//     email: string;
//     role: string;
//   };
// }




export interface AuthorDetails {
  _id: string;
  username: string;
  email: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Article {
  _id: string;
  title: string;
  content: string;
  image: string;
  tags: string[];
  createdAt: string;
  likeCount?: number; // Compteur de likes
  userLiked?: boolean; // Si l'utilisateur actuel a liké cet article
  liking?: boolean; // État de chargement pour le like
  authorDetails?: AuthorDetails;
}

