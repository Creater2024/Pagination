"use client";

import axios from "axios";
import {useState, useEffect, useRef, useCallback} from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Home() {
	const [posts, setPosts] = useState([]);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);

	const observer = useRef();

	const lastPostRef = useCallback(
		(node) => {
			if (observer.current) observer.current.disconnect();

			observer.current = new IntersectionObserver((entries) => {
				if (entries[0].isIntersecting && hasMore) {
					setPage((prevPage) => prevPage + 1);
				}
			});

			if (node) observer.current.observe(node);
		},
		[hasMore]
	);

	useEffect(() => {
		const fetchPosts = async () => {
			try {
				const res = await axios.get(
					`https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=10`
				);
				setPosts((prevPosts) => {
					const newPosts = res.data.filter(
						(post) => !prevPosts.some((prevPost) => prevPost.id === post.id)
					);
					return [...prevPosts, ...newPosts];
				});
				setHasMore(res.data.length > 0);
			} catch (error) {
				console.error("Error fetching posts:", error);
			}
		};
		fetchPosts();
	}, [page]);

	return (
		<div className="container mt-4">
			<div className="row">
				{posts.map((post, index) => {
					const isLastPost = posts.length === index + 1;
					return (
						<div
							ref={isLastPost ? lastPostRef : null}
							key={post.id}
							className="col-md-4 mb-4"
						>
							<div className="card h-100">
								<div className="card-body">
									<h5 className="card-title">{post.title}</h5>
									<p className="card-text">{post.body}</p>
								</div>
							</div>
						</div>
					);
				})}
				{hasMore && (
					<div className="col-md-12 text-center mt-4">
						<p>Loading more posts...</p>
					</div>
				)}
			</div>
		</div>
	);
}
