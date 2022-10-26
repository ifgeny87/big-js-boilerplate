import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { postLogin } from './sign.api';
import { fetchMeAction } from '../../store/actions/SigninActions';

export default function SigninPage() {
	const [error, setError] = useState<string>();
	const dispatch = useDispatch();
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting, isSubmitSuccessful },
	} = useForm(); // https://react-hook-form.com/form-builder

	console.debug('%c*** state=', 'background: #eee; color: blue', {
		errors, isSubmitting, isSubmitSuccessful,
	});

	useEffect(() => {
		if (error) {
			setTimeout(() => setError(undefined), 3000);
		}
	}, [error]);

	const onSubmit = async (data: any) => {
		return await postLogin(data.username, data.password)
			.then(() => fetchMeAction(dispatch))
			.catch(error => {
				if (error.response?.status === 400) {
					setError('Реквизиты не подошли');
				} else if (error.response?.status === 401) {
					setError('Пользвоатель не авторизован');
				} else {
					setError(error.stack);
				}
				return false;
			});
	};

	return (
		<>
			<form onSubmit={handleSubmit(onSubmit)}>
				<h1>Signin</h1>
				<div>
					Username:
					<br />
					<input {...register('username', {
						required: true,
						minLength: 4,
						maxLength: 50,
					})} />
					{errors.username ? String(errors.username.message) || 'Заполните поле' : null}
				</div>
				<div>
					Password:
					<br />
					<input {...register('password', { required: true, minLength: 4 })}
					       type="password" />
					{errors.password ? String(errors.password.message) || 'Заполните поле' : null}
				</div>
				{error ? <div>Ошибка: {error}</div> : null}
				<input type="submit" disabled={isSubmitting} />
			</form>
		</>
	);
}
